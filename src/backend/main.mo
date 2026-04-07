import Map "mo:core/Map";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── Shared types ───────────────────────────────────────────────────────────

  public type UserProfile = {
    displayName : Text;
    bio : Text;
    avatarColor : Text;
    preferredLanguage : Text;
  };

  type CodeFile = {
    name : Text;
    path : Text;
    content : Text;
    language : Text;
    lastModified : Int;
  };

  type CodeSnippet = {
    name : Text;
    description : Text;
    code : Text;
    language : Text;
    tags : [Text];
  };

  type Bookmark = {
    filePath : Text;
    lineNumber : Int;
    annotation : Text;
    timestamp : Int;
  };

  type ProjectMetadata = {
    projectName : Text;
    projectDescription : Text;
    lastOpened : Int;
  };

  type UserData = {
    profile : ?UserProfile;
    files : Map.Map<Text, CodeFile>;
    snippets : Map.Map<Text, CodeSnippet>;
    editorSettings : ?Text;
    scratchPad : ?Text;
    bookmarks : List.List<Bookmark>;
    sessionHistory : List.List<Text>;
    projects : Map.Map<Text, ProjectMetadata>;
  };

  // ── Collaboration types ────────────────────────────────────────────────────

  public type UserPresence = {
    principal : Principal;
    displayName : Text;
    avatarColor : Text;
    lastHeartbeat : Int;
  };

  public type CollabEventKind = {
    #join;
    #leave;
  };

  public type CollabEvent = {
    kind : CollabEventKind;
    timestamp : Int;
    principal : Principal;
    sessionId : Text;
  };

  public type Session = {
    id : Text;
    participants : [Principal];
    createdAt : Int;
  };

  public type SessionResult = {
    #ok : Session;
    #err : Text;
  };

  // ── Persistent state ───────────────────────────────────────────────────────

  // User data store
  let userData = Map.empty<Principal, UserData>();

  // Collaboration state
  let activeSessions = Map.empty<Text, Session>();
  let sessionEvents = Map.empty<Text, List.List<CollabEvent>>();
  // Key: sessionId # ":" # Principal.toText(principal)
  let userPresence = Map.empty<Text, UserPresence>();

  // ── Helper functions ───────────────────────────────────────────────────────

  func initializeUserData() : UserData {
    {
      profile = null;
      files = Map.empty<Text, CodeFile>();
      snippets = Map.empty<Text, CodeSnippet>();
      editorSettings = null;
      scratchPad = null;
      bookmarks = List.empty<Bookmark>();
      sessionHistory = List.empty<Text>();
      projects = Map.empty<Text, ProjectMetadata>();
    };
  };

  func presenceKey(sessionId : Text, p : Principal) : Text {
    sessionId # ":" # p.toText();
  };

  func recordEvent(sessionId : Text, kind : CollabEventKind, caller : Principal) {
    let event : CollabEvent = {
      kind;
      timestamp = Time.now();
      principal = caller;
      sessionId;
    };
    let events = switch (sessionEvents.get(sessionId)) {
      case (?existing) { existing };
      case null {
        let newList = List.empty<CollabEvent>();
        sessionEvents.add(sessionId, newList);
        newList;
      };
    };
    events.add(event);
  };

  // ── Profile functions ──────────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    switch (userData.get(caller)) {
      case (null) { null };
      case (?data) { data.profile };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let existingData = switch (userData.get(caller)) {
      case (null) { initializeUserData() };
      case (?data) { data };
    };
    userData.add(caller, { existingData with profile = ?profile });
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (userData.get(user)) {
      case (null) { null };
      case (?data) { data.profile };
    };
  };

  public shared ({ caller }) func saveUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let existingData = switch (userData.get(caller)) {
      case (null) { initializeUserData() };
      case (?data) { data };
    };
    userData.add(caller, { existingData with profile = ?profile });
  };

  // ── File operations ────────────────────────────────────────────────────────

  public shared ({ caller }) func saveFile(file : CodeFile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save files");
    };
    let existingData = switch (userData.get(caller)) {
      case (null) { initializeUserData() };
      case (?data) { data };
    };
    let files = existingData.files.clone();
    files.add(file.path, file);
    userData.add(caller, { existingData with files });
  };

  public query ({ caller }) func getFile(path : Text) : async ?CodeFile {
    switch (userData.get(caller)) {
      case (null) { null };
      case (?data) { data.files.get(path) };
    };
  };

  public query ({ caller }) func getAllFiles() : async [CodeFile] {
    switch (userData.get(caller)) {
      case (null) { [] };
      case (?data) { data.files.values().toArray() };
    };
  };

  public shared ({ caller }) func deleteFile(path : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete files");
    };
    switch (userData.get(caller)) {
      case (null) { () };
      case (?data) {
        let files = data.files.clone();
        files.remove(path);
        userData.add(caller, { data with files });
      };
    };
  };

  // ── Code snippet operations ────────────────────────────────────────────────

  public shared ({ caller }) func addCodeSnippet(snippet : CodeSnippet) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add snippets");
    };
    let existingData = switch (userData.get(caller)) {
      case (null) { initializeUserData() };
      case (?data) { data };
    };
    let snippets = existingData.snippets.clone();
    snippets.add(snippet.name, snippet);
    userData.add(caller, { existingData with snippets });
  };

  public query ({ caller }) func getCodeSnippet(name : Text) : async ?CodeSnippet {
    switch (userData.get(caller)) {
      case (null) { null };
      case (?data) { data.snippets.get(name) };
    };
  };

  public query ({ caller }) func getAllSnippets() : async [CodeSnippet] {
    switch (userData.get(caller)) {
      case (null) { [] };
      case (?data) { data.snippets.values().toArray() };
    };
  };

  public shared ({ caller }) func deleteSnippet(name : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete snippets");
    };
    switch (userData.get(caller)) {
      case (null) { () };
      case (?data) {
        let snippets = data.snippets.clone();
        snippets.remove(name);
        userData.add(caller, { data with snippets });
      };
    };
  };

  // ── Editor settings ────────────────────────────────────────────────────────

  public shared ({ caller }) func saveEditorSettings(settings : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save editor settings");
    };
    let existingData = switch (userData.get(caller)) {
      case (null) { initializeUserData() };
      case (?data) { data };
    };
    userData.add(caller, { existingData with editorSettings = ?settings });
  };

  public query ({ caller }) func getEditorSettings() : async ?Text {
    switch (userData.get(caller)) {
      case (null) { null };
      case (?data) { data.editorSettings };
    };
  };

  // ── Scratch pad ────────────────────────────────────────────────────────────

  public shared ({ caller }) func saveScratchPad(text : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save scratch pad");
    };
    let existingData = switch (userData.get(caller)) {
      case (null) { initializeUserData() };
      case (?data) { data };
    };
    userData.add(caller, { existingData with scratchPad = ?text });
  };

  public query ({ caller }) func getScratchPad() : async ?Text {
    switch (userData.get(caller)) {
      case (null) { null };
      case (?data) { data.scratchPad };
    };
  };

  // ── Bookmark operations ────────────────────────────────────────────────────

  public shared ({ caller }) func addBookmark(bookmark : Bookmark) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add bookmarks");
    };
    let existingData = switch (userData.get(caller)) {
      case (null) { initializeUserData() };
      case (?data) { data };
    };
    let bookmarks = existingData.bookmarks.clone();
    bookmarks.add(bookmark);
    userData.add(caller, { existingData with bookmarks });
  };

  public query ({ caller }) func getAllBookmarks() : async [Bookmark] {
    switch (userData.get(caller)) {
      case (null) { [] };
      case (?data) { data.bookmarks.toArray() };
    };
  };

  public shared ({ caller }) func deleteBookmark(timestamp : Int) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete bookmarks");
    };
    switch (userData.get(caller)) {
      case (null) { () };
      case (?data) {
        let bookmarks = data.bookmarks.filter(func(b) { b.timestamp != timestamp });
        userData.add(caller, { data with bookmarks });
      };
    };
  };

  // ── Session history ────────────────────────────────────────────────────────

  public shared ({ caller }) func addToSessionHistory(filePath : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add to session history");
    };
    let existingData = switch (userData.get(caller)) {
      case (null) { initializeUserData() };
      case (?data) { data };
    };
    let history = existingData.sessionHistory.clone();
    if (history.size() >= 50) {
      let arr = history.sliceToArray(1, history.size());
      history.clear();
      history.addAll(arr.values());
    };
    history.add(filePath);
    userData.add(caller, { existingData with sessionHistory = history });
  };

  public query ({ caller }) func getSessionHistory() : async [Text] {
    switch (userData.get(caller)) {
      case (null) { [] };
      case (?data) { data.sessionHistory.toArray() };
    };
  };

  public shared ({ caller }) func clearSessionHistory() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can clear session history");
    };
    switch (userData.get(caller)) {
      case (null) { () };
      case (?data) {
        userData.add(caller, { data with sessionHistory = List.empty<Text>() });
      };
    };
  };

  // ── Project operations ─────────────────────────────────────────────────────

  public shared ({ caller }) func saveProject(project : ProjectMetadata) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save projects");
    };
    let existingData = switch (userData.get(caller)) {
      case (null) { initializeUserData() };
      case (?data) { data };
    };
    let projects = existingData.projects.clone();
    projects.add(project.projectName, project);
    userData.add(caller, { existingData with projects });
  };

  public query ({ caller }) func getProject(name : Text) : async ?ProjectMetadata {
    switch (userData.get(caller)) {
      case (null) { null };
      case (?data) { data.projects.get(name) };
    };
  };

  public query ({ caller }) func getAllProjects() : async [ProjectMetadata] {
    switch (userData.get(caller)) {
      case (null) { [] };
      case (?data) { data.projects.values().toArray() };
    };
  };

  public shared ({ caller }) func deleteProject(name : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete projects");
    };
    switch (userData.get(caller)) {
      case (null) { () };
      case (?data) {
        let projects = data.projects.clone();
        projects.remove(name);
        userData.add(caller, { data with projects });
      };
    };
  };

  // ── Collaboration: joinSession ─────────────────────────────────────────────

  public shared ({ caller }) func joinSession(sessionId : Text) : async SessionResult {
    if (caller.isAnonymous()) {
      return #err("Anonymous users cannot join sessions");
    };

    // Upsert presence
    let profile = switch (userData.get(caller)) {
      case (?data) {
        switch (data.profile) {
          case (?p) { p };
          case null { { displayName = "Anonymous"; bio = ""; avatarColor = "#888888"; preferredLanguage = "text" } };
        };
      };
      case null { { displayName = "Anonymous"; bio = ""; avatarColor = "#888888"; preferredLanguage = "text" } };
    };

    let presence : UserPresence = {
      principal = caller;
      displayName = profile.displayName;
      avatarColor = profile.avatarColor;
      lastHeartbeat = Time.now();
    };
    userPresence.add(presenceKey(sessionId, caller), presence);

    // Upsert session
    let session = switch (activeSessions.get(sessionId)) {
      case (?existing) {
        // Add caller if not already participant
        let alreadyIn = existing.participants.find(func(p) { Principal.equal(p, caller) }) != null;
        if (alreadyIn) {
          existing;
        } else {
          let updated : Session = {
            existing with
            participants = existing.participants.concat([caller]);
          };
          activeSessions.add(sessionId, updated);
          updated;
        };
      };
      case null {
        let newSession : Session = {
          id = sessionId;
          participants = [caller];
          createdAt = Time.now();
        };
        activeSessions.add(sessionId, newSession);
        newSession;
      };
    };

    recordEvent(sessionId, #join, caller);
    #ok(session);
  };

  // ── Collaboration: leaveSession ────────────────────────────────────────────

  public shared ({ caller }) func leaveSession(sessionId : Text) : async Bool {
    // Remove presence
    userPresence.remove(presenceKey(sessionId, caller));

    switch (activeSessions.get(sessionId)) {
      case null { false };
      case (?session) {
        recordEvent(sessionId, #leave, caller);
        let remaining = session.participants.filter(func(p) { not Principal.equal(p, caller) });
        if (remaining.size() == 0) {
          activeSessions.remove(sessionId);
        } else {
          activeSessions.add(sessionId, { session with participants = remaining });
        };
        true;
      };
    };
  };

  // ── Collaboration: getOnlineUsers ──────────────────────────────────────────

  public query func getOnlineUsers(sessionId : Text) : async [UserPresence] {
    switch (activeSessions.get(sessionId)) {
      case null { [] };
      case (?session) {
        session.participants.filterMap(func(p) {
          userPresence.get(presenceKey(sessionId, p));
        });
      };
    };
  };

  // ── Collaboration: updatePresenceHeartbeat ─────────────────────────────────

  public shared ({ caller }) func updatePresenceHeartbeat(sessionId : Text) : async Bool {
    let key = presenceKey(sessionId, caller);
    switch (userPresence.get(key)) {
      case null { false };
      case (?presence) {
        userPresence.add(key, { presence with lastHeartbeat = Time.now() });
        true;
      };
    };
  };

  // ── Collaboration: getSessionEvents ───────────────────────────────────────

  public query func getSessionEvents(sessionId : Text, limit : Nat) : async [CollabEvent] {
    switch (sessionEvents.get(sessionId)) {
      case null { [] };
      case (?events) {
        let total = events.size();
        if (limit == 0 or total <= limit) {
          events.toArray();
        } else {
          events.sliceToArray(total - limit, total);
        };
      };
    };
  };

  // ── CI/CD types ────────────────────────────────────────────────────────────

  public type PipelineStageStatus = {
    #pending;
    #running;
    #passed;
    #failed;
  };

  public type PipelineStage = {
    name : Text;
    status : PipelineStageStatus;
    startedAt : ?Int;
    duration : ?Nat;
    logs : Text;
  };

  public type PipelineRunStatus = {
    #pending;
    #running;
    #passed;
    #failed;
  };

  public type PipelineRun = {
    id : Text;
    projectId : Text;
    commitHash : Text;
    branch : Text;
    triggeredBy : Text;
    createdAt : Int;
    status : PipelineRunStatus;
    stages : [PipelineStage];
  };

  public type DeploymentStatus = {
    #success;
    #failed;
  };

  public type DeploymentRecord = {
    id : Text;
    projectId : Text;
    environment : Text;
    version : Text;
    deployedAt : Int;
    status : DeploymentStatus;
    pipelineRunId : Text;
  };

  // ── CI/CD state ────────────────────────────────────────────────────────────

  let pipelineRuns = Map.empty<Text, PipelineRun>();
  let deploymentHistory = Map.empty<Text, List.List<DeploymentRecord>>();

  // ── CI/CD counter for id generation ────────────────────────────────────────

  var cicdCounter : Nat = 0;

  func nextCicdId(prefix : Text) : Text {
    cicdCounter += 1;
    prefix # "-" # cicdCounter.toText() # "-" # (Time.now().toNat() % 1_000_000).toText();
  };

  // ── CI/CD functions ────────────────────────────────────────────────────────

  public shared ({ caller }) func createPipelineRun(
    projectId : Text,
    commitHash : Text,
    branch : Text,
    triggeredBy : Text,
  ) : async PipelineRun {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create pipeline runs");
    };
    let id = nextCicdId("run");
    let defaultStages : [PipelineStage] = [
      { name = "lint"; status = #pending; startedAt = null; duration = null; logs = "" },
      { name = "test"; status = #pending; startedAt = null; duration = null; logs = "" },
      { name = "build"; status = #pending; startedAt = null; duration = null; logs = "" },
      { name = "deploy"; status = #pending; startedAt = null; duration = null; logs = "" },
    ];
    let run : PipelineRun = {
      id;
      projectId;
      commitHash;
      branch;
      triggeredBy;
      createdAt = Time.now();
      status = #pending;
      stages = defaultStages;
    };
    pipelineRuns.add(id, run);
    run;
  };

  public shared ({ caller }) func updatePipelineStage(
    runId : Text,
    stageName : Text,
    status : PipelineStageStatus,
    duration : ?Nat,
    logs : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update pipeline stages");
    };
    switch (pipelineRuns.get(runId)) {
      case null { Runtime.trap("Pipeline run not found: " # runId) };
      case (?run) {
        let updatedStages = run.stages.map(func(stage : PipelineStage) : PipelineStage {
          if (stage.name == stageName) {
            let startedAt : ?Int = switch (status) {
              case (#running) { ?Time.now() };
              case (_) { stage.startedAt };
            };
            { stage with status; startedAt; duration; logs };
          } else {
            stage;
          };
        });
        pipelineRuns.add(runId, { run with stages = updatedStages });
      };
    };
  };

  public shared ({ caller }) func completePipelineRun(
    runId : Text,
    overallStatus : PipelineRunStatus,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can complete pipeline runs");
    };
    switch (pipelineRuns.get(runId)) {
      case null { Runtime.trap("Pipeline run not found: " # runId) };
      case (?run) {
        pipelineRuns.add(runId, { run with status = overallStatus });
      };
    };
  };

  public shared ({ caller }) func recordDeployment(
    projectId : Text,
    environment : Text,
    pipelineRunId : Text,
    version : Text,
  ) : async DeploymentRecord {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can record deployments");
    };
    let id = nextCicdId("deploy");
    let record : DeploymentRecord = {
      id;
      projectId;
      environment;
      version;
      deployedAt = Time.now();
      status = #success;
      pipelineRunId;
    };
    let history = switch (deploymentHistory.get(projectId)) {
      case (?existing) { existing };
      case null {
        let newList = List.empty<DeploymentRecord>();
        deploymentHistory.add(projectId, newList);
        newList;
      };
    };
    history.add(record);
    record;
  };

  public query func getPipelineRuns(projectId : Text, limit : Nat) : async [PipelineRun] {
    let matching = pipelineRuns.values().filter(func(run : PipelineRun) : Bool {
      run.projectId == projectId;
    }).toArray();
    let sorted = matching.sort(func(a : PipelineRun, b : PipelineRun) : { #less; #equal; #greater } {
      Int.compare(b.createdAt, a.createdAt);
    });
    if (limit == 0 or sorted.size() <= limit) {
      sorted;
    } else {
      sorted.sliceToArray(0, limit);
    };
  };

  public query func getDeploymentHistory(projectId : Text, limit : Nat) : async [DeploymentRecord] {
    switch (deploymentHistory.get(projectId)) {
      case null { [] };
      case (?records) {
        let arr = records.toArray();
        let sorted = arr.sort(func(a : DeploymentRecord, b : DeploymentRecord) : { #less; #equal; #greater } {
          Int.compare(b.deployedAt, a.deployedAt);
        });
        if (limit == 0 or sorted.size() <= limit) {
          sorted;
        } else {
          sorted.sliceToArray(0, limit);
        };
      };
    };
  };

  public query func getPipelineRunDetail(runId : Text) : async ?PipelineRun {
    pipelineRuns.get(runId);
  };
};
