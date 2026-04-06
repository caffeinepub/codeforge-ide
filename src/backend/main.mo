import Map "mo:core/Map";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

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

  // Core storage without persistent field.
  func getUserData() : Map.Map<Principal, UserData> {
    Map.empty<Principal, UserData>();
  };

  // Required profile functions for frontend
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    switch (getUserData().get(caller)) {
      case (null) { null };
      case (?data) { data.profile };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let userData = getUserData();
    let existingData = switch (userData.get(caller)) {
      case (null) { initializeUserData() };
      case (?data) { data };
    };

    let updatedData : UserData = {
      profile = ?profile;
      files = existingData.files;
      snippets = existingData.snippets;
      editorSettings = existingData.editorSettings;
      scratchPad = existingData.scratchPad;
      bookmarks = existingData.bookmarks;
      sessionHistory = existingData.sessionHistory;
      projects = existingData.projects;
    };
    userData.add(caller, updatedData);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (getUserData().get(user)) {
      case (null) { null };
      case (?data) { data.profile };
    };
  };

  // Legacy profile functions (kept for compatibility)
  public shared ({ caller }) func saveUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let userData = getUserData();
    let existingData = switch (userData.get(caller)) {
      case (null) { initializeUserData() };
      case (?data) { data };
    };

    let updatedData : UserData = {
      profile = ?profile;
      files = existingData.files;
      snippets = existingData.snippets;
      editorSettings = existingData.editorSettings;
      scratchPad = existingData.scratchPad;
      bookmarks = existingData.bookmarks;
      sessionHistory = existingData.sessionHistory;
      projects = existingData.projects;
    };
    userData.add(caller, updatedData);
  };

  // File operations
  public shared ({ caller }) func saveFile(file : CodeFile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save files");
    };

    let userData = getUserData();
    let updatedFiles = switch (userData.get(caller)) {
      case (null) {
        let m = Map.empty<Text, CodeFile>();
        m.add(file.path, file);
        m;
      };
      case (?data) {
        let m = data.files.clone();
        m.add(file.path, file);
        m;
      };
    };

    let existingData = switch (userData.get(caller)) {
      case (null) { initializeUserData() };
      case (?data) { data };
    };

    let updatedData : UserData = {
      profile = existingData.profile;
      files = updatedFiles;
      snippets = existingData.snippets;
      editorSettings = existingData.editorSettings;
      scratchPad = existingData.scratchPad;
      bookmarks = existingData.bookmarks;
      sessionHistory = existingData.sessionHistory;
      projects = existingData.projects;
    };
    userData.add(caller, updatedData);
  };

  public query ({ caller }) func getFile(path : Text) : async ?CodeFile {
    switch (getUserData().get(caller)) {
      case (null) { null };
      case (?data) { data.files.get(path) };
    };
  };

  public query ({ caller }) func getAllFiles() : async [CodeFile] {
    switch (getUserData().get(caller)) {
      case (null) { [] };
      case (?data) { data.files.values().toArray() };
    };
  };

  public shared ({ caller }) func deleteFile(path : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete files");
    };

    let userData = getUserData();
    switch (userData.get(caller)) {
      case (null) { () };
      case (?data) {
        let files = data.files.clone();
        files.remove(path);
        let updatedData = {
          profile = data.profile;
          files;
          snippets = data.snippets;
          editorSettings = data.editorSettings;
          scratchPad = data.scratchPad;
          bookmarks = data.bookmarks;
          sessionHistory = data.sessionHistory;
          projects = data.projects;
        };
        userData.add(caller, updatedData);
      };
    };
  };

  // Code snippet operations
  public shared ({ caller }) func addCodeSnippet(snippet : CodeSnippet) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add snippets");
    };

    let userData = getUserData();
    let updatedSnippets = switch (userData.get(caller)) {
      case (null) {
        let m = Map.empty<Text, CodeSnippet>();
        m.add(snippet.name, snippet);
        m;
      };
      case (?data) {
        let m = data.snippets.clone();
        m.add(snippet.name, snippet);
        m;
      };
    };

    let existingData = switch (userData.get(caller)) {
      case (null) { initializeUserData() };
      case (?data) { data };
    };

    let updatedData : UserData = {
      profile = existingData.profile;
      files = existingData.files;
      snippets = updatedSnippets;
      editorSettings = existingData.editorSettings;
      scratchPad = existingData.scratchPad;
      bookmarks = existingData.bookmarks;
      sessionHistory = existingData.sessionHistory;
      projects = existingData.projects;
    };
    userData.add(caller, updatedData);
  };

  public query ({ caller }) func getCodeSnippet(name : Text) : async ?CodeSnippet {
    switch (getUserData().get(caller)) {
      case (null) { null };
      case (?data) { data.snippets.get(name) };
    };
  };

  public query ({ caller }) func getAllSnippets() : async [CodeSnippet] {
    switch (getUserData().get(caller)) {
      case (null) { [] };
      case (?data) { data.snippets.values().toArray() };
    };
  };

  public shared ({ caller }) func deleteSnippet(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete snippets");
    };

    let userData = getUserData();
    switch (userData.get(caller)) {
      case (null) { () };
      case (?data) {
        let snippets = data.snippets.clone();
        snippets.remove(name);
        let updatedData = {
          profile = data.profile;
          files = data.files;
          snippets;
          editorSettings = data.editorSettings;
          scratchPad = data.scratchPad;
          bookmarks = data.bookmarks;
          sessionHistory = data.sessionHistory;
          projects = data.projects;
        };
        userData.add(caller, updatedData);
      };
    };
  };

  // Editor settings operations
  public shared ({ caller }) func saveEditorSettings(settings : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save editor settings");
    };

    let userData = getUserData();
    let existingData = switch (userData.get(caller)) {
      case (null) { initializeUserData() };
      case (?data) { data };
    };

    let updatedData : UserData = {
      profile = existingData.profile;
      files = existingData.files;
      snippets = existingData.snippets;
      editorSettings = ?settings;
      scratchPad = existingData.scratchPad;
      bookmarks = existingData.bookmarks;
      sessionHistory = existingData.sessionHistory;
      projects = existingData.projects;
    };
    userData.add(caller, updatedData);
  };

  public query ({ caller }) func getEditorSettings() : async ?Text {
    switch (getUserData().get(caller)) {
      case (null) { null };
      case (?data) { data.editorSettings };
    };
  };

  // Scratch pad operations
  public shared ({ caller }) func saveScratchPad(text : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save scratch pad");
    };

    let userData = getUserData();
    let existingData = switch (userData.get(caller)) {
      case (null) { initializeUserData() };
      case (?data) { data };
    };

    let updatedData : UserData = {
      profile = existingData.profile;
      files = existingData.files;
      snippets = existingData.snippets;
      editorSettings = existingData.editorSettings;
      scratchPad = ?text;
      bookmarks = existingData.bookmarks;
      sessionHistory = existingData.sessionHistory;
      projects = existingData.projects;
    };
    userData.add(caller, updatedData);
  };

  public query ({ caller }) func getScratchPad() : async ?Text {
    switch (getUserData().get(caller)) {
      case (null) { null };
      case (?data) { data.scratchPad };
    };
  };

  // Bookmark operations
  public shared ({ caller }) func addBookmark(bookmark : Bookmark) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add bookmarks");
    };

    let userData = getUserData();
    let existingBookmarks = switch (userData.get(caller)) {
      case (null) {
        let newList = List.empty<Bookmark>();
        newList.add(bookmark);
        newList;
      };
      case (?data) {
        let newList = data.bookmarks.clone();
        newList.add(bookmark);
        newList;
      };
    };

    let existingData = switch (userData.get(caller)) {
      case (null) { initializeUserData() };
      case (?data) { data };
    };

    let updatedData : UserData = {
      profile = existingData.profile;
      files = existingData.files;
      snippets = existingData.snippets;
      editorSettings = existingData.editorSettings;
      scratchPad = existingData.scratchPad;
      bookmarks = existingBookmarks;
      sessionHistory = existingData.sessionHistory;
      projects = existingData.projects;
    };
    userData.add(caller, updatedData);
  };

  public query ({ caller }) func getAllBookmarks() : async [Bookmark] {
    switch (getUserData().get(caller)) {
      case (null) { [] };
      case (?data) { data.bookmarks.toArray() };
    };
  };

  public shared ({ caller }) func deleteBookmark(timestamp : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete bookmarks");
    };

    let userData = getUserData();
    switch (userData.get(caller)) {
      case (null) { () };
      case (?data) {
        let bookmarks = List.empty<Bookmark>();
        for (b in data.bookmarks.values()) {
          if (b.timestamp != timestamp) {
            bookmarks.add(b);
          };
        };
        let updatedData = {
          profile = data.profile;
          files = data.files;
          snippets = data.snippets;
          editorSettings = data.editorSettings;
          scratchPad = data.scratchPad;
          bookmarks;
          sessionHistory = data.sessionHistory;
          projects = data.projects;
        };
        userData.add(caller, updatedData);
      };
    };
  };

  // Session history operations
  public shared ({ caller }) func addToSessionHistory(filePath : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to session history");
    };

    let userData = getUserData();
    let history = switch (userData.get(caller)) {
      case (null) {
        let newList = List.empty<Text>();
        newList.add(filePath);
        newList;
      };
      case (?data) {
        let existing = data.sessionHistory.clone();
        if (existing.size() >= 50) {
          let arrayHistory = existing.toArray();
          existing.clear();
          if (arrayHistory.size() > 0) {
            // Take the last 49 elements
            let trimmedHistory = arrayHistory.sliceToArray(1, arrayHistory.size() - 1);
            existing.clear();
            for (element in trimmedHistory.values()) {
              existing.add(element);
            };
          };
        };
        existing.add(filePath);
        existing;
      };
    };

    let existingData = switch (userData.get(caller)) {
      case (null) { initializeUserData() };
      case (?data) { data };
    };

    let updatedData : UserData = {
      profile = existingData.profile;
      files = existingData.files;
      snippets = existingData.snippets;
      editorSettings = existingData.editorSettings;
      scratchPad = existingData.scratchPad;
      bookmarks = existingData.bookmarks;
      sessionHistory = history;
      projects = existingData.projects;
    };
    userData.add(caller, updatedData);
  };

  public query ({ caller }) func getSessionHistory() : async [Text] {
    switch (getUserData().get(caller)) {
      case (null) { [] };
      case (?data) { data.sessionHistory.toArray() };
    };
  };

  public shared ({ caller }) func clearSessionHistory() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear session history");
    };

    let userData = getUserData();
    switch (userData.get(caller)) {
      case (null) { () };
      case (?data) {
        let updatedData = {
          profile = data.profile;
          files = data.files;
          snippets = data.snippets;
          editorSettings = data.editorSettings;
          scratchPad = data.scratchPad;
          bookmarks = data.bookmarks;
          sessionHistory = List.empty<Text>();
          projects = data.projects;
        };
        userData.add(caller, updatedData);
      };
    };
  };

  // Project operations
  public shared ({ caller }) func saveProject(project : ProjectMetadata) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save projects");
    };

    let userData = getUserData();
    let updatedProjects = switch (userData.get(caller)) {
      case (null) {
        let m = Map.empty<Text, ProjectMetadata>();
        m.add(project.projectName, project);
        m;
      };
      case (?data) {
        let m = data.projects.clone();
        m.add(project.projectName, project);
        m;
      };
    };

    let existingData = switch (userData.get(caller)) {
      case (null) { initializeUserData() };
      case (?data) { data };
    };

    let updatedData : UserData = {
      profile = existingData.profile;
      files = existingData.files;
      snippets = existingData.snippets;
      editorSettings = existingData.editorSettings;
      scratchPad = existingData.scratchPad;
      bookmarks = existingData.bookmarks;
      sessionHistory = existingData.sessionHistory;
      projects = updatedProjects;
    };
    userData.add(caller, updatedData);
  };

  public query ({ caller }) func getProject(name : Text) : async ?ProjectMetadata {
    switch (getUserData().get(caller)) {
      case (null) { null };
      case (?data) { data.projects.get(name) };
    };
  };

  public query ({ caller }) func getAllProjects() : async [ProjectMetadata] {
    switch (getUserData().get(caller)) {
      case (null) { [] };
      case (?data) { data.projects.values().toArray() };
    };
  };

  public shared ({ caller }) func deleteProject(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete projects");
    };

    let userData = getUserData();
    switch (userData.get(caller)) {
      case (null) { () };
      case (?data) {
        let projects = data.projects.clone();
        projects.remove(name);
        let updatedData = {
          profile = data.profile;
          files = data.files;
          snippets = data.snippets;
          editorSettings = data.editorSettings;
          scratchPad = data.scratchPad;
          bookmarks = data.bookmarks;
          sessionHistory = data.sessionHistory;
          projects;
        };
        userData.add(caller, updatedData);
      };
    };
  };

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
};
