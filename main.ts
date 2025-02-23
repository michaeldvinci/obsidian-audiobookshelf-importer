import {  request, Notice, Plugin, PluginSettingTab, Setting, App } from "obsidian";

interface ABSPluginSettings {
  host: string;
  apiKey: string;
  
  abDir: string;
  abEnable: boolean;
  abLib: string;
  abSortBy: string;
  abTemplate: string;

  ebDir: string;
  ebEnable: boolean;
  ebLib: string;
  ebSortBy: string;
  ebTemplate: string;

  podDir: string;
  podEnable: boolean;
  podLib: string;
  podSortBy: string;
  podTemplate: string;
}

const DEFAULT_SETTINGS: ABSPluginSettings = {
  host: "",
  apiKey: "",

  abDir: "",
  abEnable: false,
  abLib: "",
  abSortBy: "",
  abTemplate: "",

  ebDir: "",
  ebEnable: false,
  ebLib: "",
  ebSortBy: "",
  ebTemplate: "",
  
  podDir: "",
  podEnable: false,
  podLib: "",
  podSortBy: "",
  podTemplate: "",
};

export default class ABSPlugin extends Plugin {
  settings: ABSPluginSettings;

  async loadSettings() {
    this.settings = Object.assign(
      {}, 
      DEFAULT_SETTINGS, 
      await this.loadData()
    );
  }

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new ABSPluginSettingTab(this.app, this));

    const ribbonIconEl = this.addRibbonIcon("audio-file", "ABS", () => {
      // new Notice("Fetching audiobooks...");
      this.fetchAndCreateNotes();
    });

    this.addCommand({
      id: "fetch-books",
      name: "Fetch books and create notes",
      callback: async () => {
        await this.fetchAndCreateNotes();
      },
    });
  }

  async fetchAndCreateNotes() {
    if (!this.settings.host || !this.settings.apiKey) {
      new Notice("Please configure API settings in the Audiobookshelf Importer settings.");
      return;
    }
    if ((this.settings.abEnable === false) && (this.settings.ebEnable === false) && (this.settings.podEnable === false) ) {
      new Notice("Please enable a library to import in the Audiobookshelf Importer settings.");
      return;
    }

    if (this.settings.abEnable === true) {
      this.abImport()
    }

    if (this.settings.ebEnable === true) {
      this.ebImport()
    }

    if (this.settings.podEnable === true) {
      this.podImport()
    }
  }

  async abImport() {
    const apiUrl = `https://${this.settings.host}/api/libraries/${this.settings.abLib}/items?sort=media.metadata.title`;

    try {
      const response = await request({
        url: apiUrl,
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.settings.apiKey}`,
        },
      });
  

      if (!response) {
        throw new Error(`Failed to fetch books: ${response}`);
      }

    const data = JSON.parse(response);
    
    const books = (data.results || [])
      .map((book: any) => ({
        id: book.id,
        relPath: book.relPath,
        metadata: book.media?.metadata || {}, 
      }));

    const folder = this.app.vault.getAbstractFileByPath(this.settings.abDir);
    if (!folder) {
      await this.app.vault.createFolder(this.settings.abDir);
    }

    const abJsonData : any = {};
    for (const book of books) {
      var metadata = book.metadata;
      abJsonData.metadata = metadata;
      abJsonData.authorName = metadata.authorName;
      abJsonData.authorNameLF = metadata.authorNameLF;
      abJsonData.coverURL = `https://${this.settings.host}/audiobookshelf/api/items/${book.id}/cover`;
      abJsonData.description = metadata.description;
      abJsonData.jsonData = JSON.stringify(book, null, 2);
      abJsonData.narrator = metadata.narrator;
      abJsonData.publishedDate = metadata.publishedDate;
      abJsonData.publishedYear = metadata.publishedYear;
      abJsonData.publisher = metadata.publisher;
      abJsonData.title = metadata.title;

      const sanitizedTitle = metadata.title.replace(/[\/:*?"<>|]/g, "");

      var sortArtist = abJsonData.authorNameLF
      if (this.settings.abSortBy == "authorNameLF") {
        sortArtist = abJsonData.authorNameLF
      }else if (this.settings.abSortBy == "authorName") {
        sortArtist = abJsonData.authorName
      }

      var filePath = `${this.settings.abDir}/${sortArtist}/${sanitizedTitle}.md`;

      const regex = /\b\d+(\.\d+)?,/;

      if (book.metadata.seriesName != "") {
        var origName = book.metadata.seriesName
        if (regex.test(origName)) {
          const parts = origName.split(/(?<=\b\d+(\.\d+)?),\s*/);
          origName = parts[0]
        }
        const seriesTitle = origName.replace(/\s+#\d+(\.\d+)?$/, "").trim();
        const numberMatch = origName.match(/\s+#(\d+(\.\d+)?)$/);
        const number = numberMatch ? numberMatch[1] : null;
        filePath = `${this.settings.abDir}/${sortArtist}/${seriesTitle}/${number} | ${sanitizedTitle}.md`;
      }

      // console.log(filePath)
      if (!this.app.vault.getAbstractFileByPath(filePath)) {
        await this.ensureFolderExists(filePath);
        await this.app.vault.create(filePath, this.getBookTemplate(abJsonData, this.settings.abTemplate))
        // await this.app.vault.create(filePath, JSON.stringify(book, null, 2));
        // console.log(`Created: ${filePath}`);
      } else {
        // console.log(`Skipped: ${filePath} (Already exists)`);
      }
    }
      new Notice("Audiobooks fetched and notes created successfully!");
    } catch (error) {
      console.error("Error fetching Audiobooks:", error, " from ", apiUrl);
      new Notice("Failed to fetch Audiobooks. Check the console for details.");
    }
  }

  async ebImport() {
    const apiUrl = `https://${this.settings.host}/api/libraries/${this.settings.ebLib}/items?sort=media.metadata.title`;

    try {
      const ebResponse = await request({
        url: apiUrl,
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.settings.apiKey}`,
        },
      });
  

      if (!ebResponse) {
        throw new Error(`Failed to fetch books: ${ebResponse}`);
      }

    const data = JSON.parse(ebResponse);
    
    const ebBooks = (data.results || [])
      .map((eBook: any) => ({
        id: eBook.id,
        relPath: eBook.relPath,
        metadata: eBook.media?.metadata || {}, 
      }));

    const folder = this.app.vault.getAbstractFileByPath(this.settings.ebDir);
    if (!folder) {
      await this.app.vault.createFolder(this.settings.ebDir);
    }

    const ebJsonData : any = {};
    for (const eBook of ebBooks) {
      var metadata = eBook.metadata;
      ebJsonData.metadata = metadata;
      ebJsonData.authorName = metadata.authorName;
      ebJsonData.authorNameLF = metadata.authorNameLF;
      ebJsonData.coverURL = `https://${this.settings.host}/audiobookshelf/api/items/${eBook.id}/cover`;
      ebJsonData.description = metadata.description;
      ebJsonData.jsonData = JSON.stringify(eBook, null, 2);
      ebJsonData.narrator = metadata.narrator;
      ebJsonData.publishedDate = metadata.publishedDate;
      ebJsonData.publishedYear = metadata.publishedYear;
      ebJsonData.publisher = metadata.publisher;
      ebJsonData.title = metadata.title;

      const sanitizedTitle = metadata.title.replace(/[\/:*?"<>|]/g, "");

      var ebSortArtist = ebJsonData.authorNameLF
      if (this.settings.ebSortBy == "authorNameLF") {
        ebSortArtist = ebJsonData.authorNameLF
      }else if (this.settings.ebSortBy == "authorName") {
        ebSortArtist = ebJsonData.authorName
      }

      var filePath = `${this.settings.ebDir}/${ebSortArtist}/${sanitizedTitle}.md`;

      const regex = /\b\d+(\.\d+)?,/;

      if (eBook.metadata.seriesName != "") {
        var origName = eBook.metadata.seriesName
        if (regex.test(origName)) {
          const parts = origName.split(/(?<=\b\d+(\.\d+)?),\s*/);
          origName = parts[0]
        }
        const seriesTitle = origName.replace(/\s+#\d+(\.\d+)?$/, "").trim();
        const numberMatch = origName.match(/\s+#(\d+(\.\d+)?)$/);
        const number = numberMatch ? numberMatch[1] : null;
        filePath = `${this.settings.ebDir}/${ebSortArtist}/${seriesTitle}/${number} | ${sanitizedTitle}.md`;
      }

      // console.log(filePath)
      if (!this.app.vault.getAbstractFileByPath(filePath)) {
        await this.ensureFolderExists(filePath);
        await this.app.vault.create(filePath, this.getBookTemplate(ebJsonData, this.settings.ebTemplate))
        // await this.app.vault.create(filePath, JSON.stringify(book, null, 2));
        // console.log(`Created: ${filePath}`);
      } else {
        // console.log(`Skipped: ${filePath} (Already exists)`);
      }
    }
      new Notice("eBooks fetched and notes created successfully!");
    } catch (error) {
      console.error("Error fetching eBooks:", error, " from ", apiUrl);
      new Notice("Failed to fetch eBooks. Check the console for details.");
    }
  }

  async podImport() {
    const apiUrl = `https://${this.settings.host}/api/libraries/${this.settings.podLib}/items?sort=media.metadata.title`;

    try {
      const podResponse = await request({
        url: apiUrl,
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.settings.apiKey}`,
        },
      });
      if (!podResponse) {
        throw new Error(`Failed to fetch books: ${podResponse}`);
      }

    const data = JSON.parse(podResponse);
    
    const podcasts = (data.results || [])
      .map((podcast: any) => ({
        id: podcast.id,
        relPath: podcast.relPath,
        metadata: podcast.media?.metadata || {}, 
      }));

    const folder = this.app.vault.getAbstractFileByPath(this.settings.podDir);
    if (!folder) {
      await this.app.vault.createFolder(this.settings.podDir);
    }
    var epFilePath = "";
    const podJsonData : any = {};
    for (const podcast of podcasts) {
      var metadata = podcast.metadata;
      podJsonData.metadata = metadata;
      podJsonData.author = metadata.author;
      podJsonData.coverURL = metadata.imageUrl;
      podJsonData.description = metadata.description;
      podJsonData.jsonData = JSON.stringify(podcast, null, 2);
      podJsonData.narrator = metadata.narrator;
      podJsonData.publishedDate = metadata.publishedDate;
      podJsonData.publishedYear = metadata.publishedYear;
      podJsonData.publisher = metadata.publisher;
      podJsonData.title = metadata.title;

      const sanitizedTitle = metadata.title.replace(/[\/:*?"<>|]/g, "");

      var epApi = `https://${this.settings.host}/api/items/${podcast.id}?sort=publishedDate`;
      try {
        const epResponse = await request({
          url: epApi,
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.settings.apiKey}`,
          },
        });
  
        if (!epResponse) {
          throw new Error(`Failed to fetch episodes: ${epResponse}`);
        }
  
        const epData = JSON.parse(epResponse);
  
        const episodes = (epData.media.episodes || [])
          .map((episode: any) => ({
            oldEpisodeId: episode.oldEpisodeId,
            index: episode.index,
            season: episode.season,
            episode: episode.episode,
            episodeType: episode.episodeType,
            title: episode.title,
            subtitle: episode.subtitle,
            description: episode.description,
            pubDate: episode.pubDate,
            audioFile: episode.audioFile
          }));
        
        for (const episode of episodes) {
          podJsonData.metadata = JSON.stringify(episode.audioFile, null, 2);
          podJsonData.description = episode.description;
          podJsonData.jsonData = JSON.stringify(episode.audioFile, null, 2);
          podJsonData.publishedDate = episode.pubDate;
          podJsonData.publishedYear = episode.audioFile.metaTags.tagGenre;
          podJsonData.title = episode.title;

          const epSanitizedTitle = episode.title.replace(/[\/:*?"<>|]/g, "");
          epFilePath = `${this.settings.podDir}/${sanitizedTitle}/${epSanitizedTitle}.md`;
          if (!this.app.vault.getAbstractFileByPath(epFilePath)) {
            await this.ensureFolderExists(epFilePath);
            await this.app.vault.create(epFilePath, this.getBookTemplate(podJsonData, this.settings.podTemplate))
            // await this.app.vault.create(filePath, JSON.stringify(book, null, 2));
            // console.log(`Created: ${filePath}`);
          } else {
            // console.log(`Skipped: ${filePath} (Already exists)`);
          }
        }
        
      } catch (error) {
        console.error("Error fetching Episodes:", error, " from ", apiUrl);
        new Notice("Failed to fetch Episodes. Check the console for details.");
      }
    }
      new Notice("Podcasts fetched and notes created successfully!");
    } catch (error) {
      console.error("Error fetching Podcasts:", error, " from ", apiUrl);
      new Notice("Failed to fetch Podcasts. Check the console for details.");
    }
  }
  
  async ensureFolderExists(filePath: string) {
    const folderPath = filePath.substring(0, filePath.lastIndexOf("/"));
  
    if (!folderPath) return;
  
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!folder) {
      await this.app.vault.createFolder(folderPath);
      console.log(`Created folder: ${folderPath}`);
    }
  }

  getBookTemplate(jsonData: { [x: string]: any; }, template: string) {
    return template
      .replace(/{{(.*?)}}/g, (_, key) => {
        return jsonData[key.trim()] || "";
        });
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

function addTextSetting(container: HTMLElement, label: string, description: string, placeholder: string, settingKey: string) {
  const settingContainer = container.createDiv();
  settingContainer.createEl("label", { text: label, cls: "ab-setting-item-name" });
  
  new Setting(settingContainer)
    // .setName(label)
    .setDesc(description)
    .addText(text => {
      text.setPlaceholder(placeholder)
        .setValue(this.plugin.settings[settingKey])
        .onChange(async (value) => {
          this.plugin.settings[settingKey] = value;
          await this.plugin.saveSettings();
        });
      text.inputEl.style.width = "100%";
    }); 
}

function addDropdownSetting(container: HTMLElement, label: string, settingKey: string , options: any) {
  const settingContainer = container.createDiv();
  settingContainer.createEl("label", { text: label, cls: "ab-setting-item-name" });
  
  new Setting(settingContainer)
    .addDropdown(dropdown => {
      dropdown.addOptions(options)
        .setValue(this.plugin.settings[settingKey])
        .onChange(async (value) => {
          console.log("value", value);
          this.plugin.settings[settingKey] = value;
          await this.plugin.saveSettings();
        });
      dropdown.selectEl.style.width = "100%";
    });
}

function addToggleSetting(container: HTMLElement, label: string, description: string, settingKey: string, toggleCallback: any) {
  const settingContainer = container.createDiv();
  
  new Setting(settingContainer)
    .setName(label)
    .setDesc(description)
    .addToggle(toggle => {
      toggle.setValue(this.plugin.settings[settingKey])
        .onChange(async (value) => {
          this.plugin.settings[settingKey] = value;
          await this.plugin.saveSettings();
          toggleCallback(value);
        });
    });
}

function addTextAreaSetting(container: HTMLElement, label: string , placeholder: string, settingKey: string) {
  const settingContainer = container.createDiv();
  settingContainer.createEl("label", { text: label, cls: "ab-setting-item-name" });
  
  new Setting(settingContainer)
    .addTextArea(textArea => {
      textArea.setPlaceholder(placeholder)
        .setValue(this.plugin.settings[settingKey])
        .onChange(async (value) => {
          this.plugin.settings[settingKey] = value.trim();
          await this.plugin.saveSettings();
        });
      textArea.inputEl.style.height = "150px";
      textArea.inputEl.style.width = "100%";
    });
}


class ABSPluginSettingTab extends PluginSettingTab {
  plugin: ABSPlugin;

  constructor(app: App, plugin: Plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Audiobookshelf Importer Settings" });

    addTextSetting.call(this, containerEl, "ABS Host", "Enter the base URL (without \"https://\")", "example.abs.org", "host");
    addTextSetting.call(this, containerEl, "API Key", "Enter your API Key", "<apiKey>", "apiKey");

    addToggleSetting.call(this, containerEl, "Audiobooks", "Toggle to enable + show settings.", "abEnable", (value) => {
      abFieldsContainer.style.display = value ? "block" : "none";
    });
  
    const abWrapper = containerEl.createDiv({ cls: "stacked-inputs" });
    const abFieldsContainer = abWrapper.createDiv({ cls: "fields-container" });

    addTextSetting.call(this, abFieldsContainer, "Local Directory:", "", "ABS/Audiobooks", "abDir");
    addTextSetting.call(this, abFieldsContainer, "Library ID:", "", "ads76yfsd-sd767-p9aa-34dsd-989s8dasd", "abLib");
    addDropdownSetting.call(this, abFieldsContainer, "Page Sort:", "abSortBy", {
      ["authorName"]: "Author Name | FN, LN (Asc)",
      ["authorNameLF"]: "Author Name | LN, FN (Asc)"
    });
    addTextAreaSetting.call(this, abFieldsContainer, "Page Template:", "<!--!>", "abTemplate");
    
    abWrapper.appendChild(abFieldsContainer);
    abFieldsContainer.style.display = this.plugin.settings.abEnable ? "block" : "none";

    addToggleSetting.call(this, containerEl, "Ebooks", "Toggle to enable + show settings.", "ebEnable", (value) => {
      ebFieldsContainer.style.display = value ? "block" : "none";
    });

    const ebWrapper = containerEl.createDiv({ cls: "stacked-inputs" });
    const ebFieldsContainer = ebWrapper.createDiv({ cls: "fields-container" });

    addTextSetting.call(this, ebFieldsContainer, "Local Directory:", "", "ABS/Ebooks", "ebDir");
    addTextSetting.call(this, ebFieldsContainer, "Library ID:", "", "ads76yfsd-sd767-p9aa-34dsd-989s8dasd", "ebLib");
    addDropdownSetting.call(this, ebFieldsContainer, "Page Sort:", "ebSortBy", {
      ["authorName"]: "Author Name | FN, LN (Asc)",
      ["authorNameLF"]: "Author Name | LN, FN (Asc)"
    });
    addTextAreaSetting.call(this, ebFieldsContainer, "Page Template:", "<!--!>", "ebTemplate");

    ebWrapper.appendChild(ebFieldsContainer);
    ebFieldsContainer.style.display = this.plugin.settings.ebEnable ? "block" : "none";

    addToggleSetting.call(this, containerEl, "Podcasts", "Toggle to enable + show settings.", "podEnable", (value) => {
      podFieldsContainer.style.display = value ? "block" : "none";
    });

    const podWrapper = containerEl.createDiv({ cls: "stacked-inputs" });
    const podFieldsContainer = podWrapper.createDiv({ cls: "fields-container" });

    addTextSetting.call(this, podFieldsContainer, "Local Directory:", "", "ABS/Podcasts", "podDir");
    addTextSetting.call(this, podFieldsContainer, "Library ID:", "", "ads76yfsd-sd767-p9aa-34dsd-989s8dasd", "podLib");
    addDropdownSetting.call(this, podFieldsContainer, "Page Sort:", "podSortBy", {
      ["authorName"]: "Author Name | FN, LN (Asc)",
      ["authorNameLF"]: "Author Name | LN, FN (Asc)"
    });
    addTextAreaSetting.call(this, podFieldsContainer, "Page Template:", "<!--!>", "podTemplate");

    podWrapper.appendChild(podFieldsContainer);
    podFieldsContainer.style.display = this.plugin.settings.podEnable ? "block" : "none";

  }
}

