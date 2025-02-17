/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ABSPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  host: "",
  library: "",
  token: "",
  folder: "",
  template: ""
};
var ABSPlugin = class extends import_obsidian.Plugin {
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
      new import_obsidian.Notice("Fetching audiobooks...");
      this.fetchAndCreateNotes();
    });
    this.addCommand({
      id: "fetch-books",
      name: "Fetch books and create notes",
      callback: async () => {
        await this.fetchAndCreateNotes();
      }
    });
  }
  async fetchAndCreateNotes() {
    if (!this.settings.host || !this.settings.library || !this.settings.token) {
      new import_obsidian.Notice("Please configure API settings in the ABS Plugin settings.");
      return;
    }
    if (!this.settings.folder) {
      new import_obsidian.Notice("Please configure destination folder in the ABS Plugin settings.");
      return;
    }
    const apiUrl = `https://${this.settings.host}/api/libraries/${this.settings.library}/items?sort=media.metadata.title`;
    try {
      const response = await (0, import_obsidian.request)({
        url: apiUrl,
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.settings.token}`
        }
      });
      if (!response) {
        throw new Error(`Failed to fetch books: ${response}`);
      }
      const data = JSON.parse(response);
      const books = (data.results || []).map((book) => {
        var _a;
        return {
          id: book.id,
          relPath: book.relPath,
          metadata: ((_a = book.media) == null ? void 0 : _a.metadata) || {}
        };
      }).sort((a, b) => a.relPath.localeCompare(b.relPath));
      const folder = this.app.vault.getAbstractFileByPath(`${this.settings.folder}`);
      if (!folder) {
        await this.app.vault.createFolder(`${this.settings.folder}`);
      }
      let abData = {};
      const abJsonData = {};
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
        var filePath = "";
        if (book.metadata.seriesName != "") {
          filePath = `${this.settings.folder}/${abJsonData.authorNameLF}/${book.metadata.seriesName.replace(/\s+#\d+$/, "").trim()}/${sanitizedTitle}.md`;
        } else {
          filePath = `${this.settings.folder}/${abJsonData.authorNameLF}/${sanitizedTitle}.md`;
        }
        if (!this.app.vault.getAbstractFileByPath(filePath)) {
          await this.ensureFolderExists(filePath);
          await this.app.vault.create(filePath, this.getBookTemplate(abJsonData));
          console.log(`Created: ${filePath}`);
        } else {
          console.log(`Skipped: ${filePath} (Already exists)`);
        }
      }
      new import_obsidian.Notice("Books fetched and notes created successfully!");
    } catch (error) {
      console.error("Error fetching books:", error, " from ", apiUrl);
      new import_obsidian.Notice("Failed to fetch books. Check the console for details.");
    }
  }
  async ensureFolderExists(filePath) {
    const folderPath = filePath.substring(0, filePath.lastIndexOf("/"));
    if (!folderPath)
      return;
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!folder) {
      await this.app.vault.createFolder(folderPath);
      console.log(`Created folder: ${folderPath}`);
    }
  }
  getBookTemplate(abJsonData) {
    return `${this.settings.template}`.replace(/{{(.*?)}}/g, (_, key) => {
      return abJsonData[key.trim()] || "";
    });
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var ABSPluginSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "ABS Plugin Settings" });
    new import_obsidian.Setting(containerEl).setName("API Host").setDesc("Enter the base URL of the API (without https://)").addText(
      (text) => text.setPlaceholder("example.abs.org").setValue(this.plugin.settings.host).onChange(async (value) => {
        this.plugin.settings.host = value.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Library").setDesc("Enter the library ID or name").addText(
      (text) => text.setPlaceholder("audiobooks").setValue(this.plugin.settings.library).onChange(async (value) => {
        this.plugin.settings.library = value.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("API Token").setDesc("Enter your API token").addText(
      (text) => text.setPlaceholder("your-token-here").setValue(this.plugin.settings.token).onChange(async (value) => {
        this.plugin.settings.token = value.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Folder").setDesc("Where to create pages.").addText(
      (text) => text.setPlaceholder("ABS").setValue(this.plugin.settings.folder).onChange(async (value) => {
        this.plugin.settings.folder = value.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Template").setDesc("Template for new pages.").addTextArea(
      (text) => text.setPlaceholder("<!--!>").setValue(this.plugin.settings.template).onChange(async (value) => {
        this.plugin.settings.template = value.trim();
        await this.plugin.saveSettings();
      })
    );
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgIHJlcXVlc3QsIE5vdGljZSwgUGx1Z2luLCBQbHVnaW5TZXR0aW5nVGFiLCBTZXR0aW5nIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5cbmludGVyZmFjZSBBQlNQbHVnaW5TZXR0aW5ncyB7XG4gIGhvc3Q6IHN0cmluZztcbiAgbGlicmFyeTogc3RyaW5nO1xuICB0b2tlbjogc3RyaW5nO1xuICBmb2xkZXI6IHN0cmluZztcbiAgdGVtcGxhdGU6IHN0cmluZztcbn1cblxuY29uc3QgREVGQVVMVF9TRVRUSU5HUzogQUJTUGx1Z2luU2V0dGluZ3MgPSB7XG4gIGhvc3Q6IFwiXCIsXG4gIGxpYnJhcnk6IFwiXCIsXG4gIHRva2VuOiBcIlwiLFxuICBmb2xkZXI6IFwiXCIsXG4gIHRlbXBsYXRlOiBcIlwiLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQUJTUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcbiAgc2V0dGluZ3M6IEFCU1BsdWdpblNldHRpbmdzO1xuXG4gIGFzeW5jIGxvYWRTZXR0aW5ncygpIHtcbiAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbihcbiAgICAgIHt9LCBcbiAgICAgIERFRkFVTFRfU0VUVElOR1MsIFxuICAgICAgYXdhaXQgdGhpcy5sb2FkRGF0YSgpXG4gICAgKTtcbiAgfVxuXG4gIGFzeW5jIG9ubG9hZCgpIHtcbiAgICBhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xuXG4gICAgdGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBBQlNQbHVnaW5TZXR0aW5nVGFiKHRoaXMuYXBwLCB0aGlzKSk7XG5cbiAgICBjb25zdCByaWJib25JY29uRWwgPSB0aGlzLmFkZFJpYmJvbkljb24oXCJhdWRpby1maWxlXCIsIFwiQUJTXCIsICgpID0+IHtcbiAgICAgIG5ldyBOb3RpY2UoXCJGZXRjaGluZyBhdWRpb2Jvb2tzLi4uXCIpO1xuICAgICAgdGhpcy5mZXRjaEFuZENyZWF0ZU5vdGVzKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6IFwiZmV0Y2gtYm9va3NcIixcbiAgICAgIG5hbWU6IFwiRmV0Y2ggYm9va3MgYW5kIGNyZWF0ZSBub3Rlc1wiLFxuICAgICAgY2FsbGJhY2s6IGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgdGhpcy5mZXRjaEFuZENyZWF0ZU5vdGVzKCk7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZmV0Y2hBbmRDcmVhdGVOb3RlcygpIHtcbiAgICBpZiAoIXRoaXMuc2V0dGluZ3MuaG9zdCB8fCAhdGhpcy5zZXR0aW5ncy5saWJyYXJ5IHx8ICF0aGlzLnNldHRpbmdzLnRva2VuKSB7XG4gICAgICBuZXcgTm90aWNlKFwiUGxlYXNlIGNvbmZpZ3VyZSBBUEkgc2V0dGluZ3MgaW4gdGhlIEFCUyBQbHVnaW4gc2V0dGluZ3MuXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuc2V0dGluZ3MuZm9sZGVyKSB7XG4gICAgICBuZXcgTm90aWNlKFwiUGxlYXNlIGNvbmZpZ3VyZSBkZXN0aW5hdGlvbiBmb2xkZXIgaW4gdGhlIEFCUyBQbHVnaW4gc2V0dGluZ3MuXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGFwaVVybCA9IGBodHRwczovLyR7dGhpcy5zZXR0aW5ncy5ob3N0fS9hcGkvbGlicmFyaWVzLyR7dGhpcy5zZXR0aW5ncy5saWJyYXJ5fS9pdGVtcz9zb3J0PW1lZGlhLm1ldGFkYXRhLnRpdGxlYDtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlcXVlc3Qoe1xuICAgICAgICB1cmw6IGFwaVVybCxcbiAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke3RoaXMuc2V0dGluZ3MudG9rZW59YCxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICBcblxuICAgICAgaWYgKCFyZXNwb25zZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBmZXRjaCBib29rczogJHtyZXNwb25zZX1gKTtcbiAgICAgIH1cblxuICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKHJlc3BvbnNlKTtcbiAgICBcbiAgICBjb25zdCBib29rcyA9IChkYXRhLnJlc3VsdHMgfHwgW10pXG4gICAgICAubWFwKChib29rOiBhbnkpID0+ICh7XG4gICAgICAgIGlkOiBib29rLmlkLFxuICAgICAgICByZWxQYXRoOiBib29rLnJlbFBhdGgsXG4gICAgICAgIG1ldGFkYXRhOiBib29rLm1lZGlhPy5tZXRhZGF0YSB8fCB7fSwgXG4gICAgICB9KSlcbiAgICAgIC5zb3J0KChhLCBiKSA9PiBhLnJlbFBhdGgubG9jYWxlQ29tcGFyZShiLnJlbFBhdGgpKTsgXG5cbiAgICBjb25zdCBmb2xkZXIgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoYCR7dGhpcy5zZXR0aW5ncy5mb2xkZXJ9YCk7XG4gICAgaWYgKCFmb2xkZXIpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNyZWF0ZUZvbGRlcihgJHt0aGlzLnNldHRpbmdzLmZvbGRlcn1gKTtcbiAgICB9XG5cbiAgICBsZXQgYWJEYXRhOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG4gICAgY29uc3QgYWJKc29uRGF0YSA6IGFueSA9IHt9O1xuICAgIGZvciAoY29uc3QgYm9vayBvZiBib29rcykge1xuICAgICAgdmFyIG1ldGFkYXRhID0gYm9vay5tZXRhZGF0YTtcbiAgICAgIGFiSnNvbkRhdGEubWV0YWRhdGEgPSBtZXRhZGF0YTtcbiAgICAgIGFiSnNvbkRhdGEuYXV0aG9yTmFtZSA9IG1ldGFkYXRhLmF1dGhvck5hbWU7XG4gICAgICBhYkpzb25EYXRhLmF1dGhvck5hbWVMRiA9IG1ldGFkYXRhLmF1dGhvck5hbWVMRjtcbiAgICAgIGFiSnNvbkRhdGEuY292ZXJVUkwgPSBgaHR0cHM6Ly8ke3RoaXMuc2V0dGluZ3MuaG9zdH0vYXVkaW9ib29rc2hlbGYvYXBpL2l0ZW1zLyR7Ym9vay5pZH0vY292ZXJgO1xuICAgICAgYWJKc29uRGF0YS5kZXNjcmlwdGlvbiA9IG1ldGFkYXRhLmRlc2NyaXB0aW9uO1xuICAgICAgYWJKc29uRGF0YS5qc29uRGF0YSA9IEpTT04uc3RyaW5naWZ5KGJvb2ssIG51bGwsIDIpO1xuICAgICAgYWJKc29uRGF0YS5uYXJyYXRvciA9IG1ldGFkYXRhLm5hcnJhdG9yO1xuICAgICAgYWJKc29uRGF0YS5wdWJsaXNoZWREYXRlID0gbWV0YWRhdGEucHVibGlzaGVkRGF0ZTtcbiAgICAgIGFiSnNvbkRhdGEucHVibGlzaGVkWWVhciA9IG1ldGFkYXRhLnB1Ymxpc2hlZFllYXI7XG4gICAgICBhYkpzb25EYXRhLnB1Ymxpc2hlciA9IG1ldGFkYXRhLnB1Ymxpc2hlcjtcbiAgICAgIGFiSnNvbkRhdGEudGl0bGUgPSBtZXRhZGF0YS50aXRsZTtcblxuICAgICAgY29uc3Qgc2FuaXRpemVkVGl0bGUgPSBtZXRhZGF0YS50aXRsZS5yZXBsYWNlKC9bXFwvOio/XCI8PnxdL2csIFwiXCIpO1xuICAgICAgdmFyIGZpbGVQYXRoID0gXCJcIlxuXG4gICAgICBpZiAoYm9vay5tZXRhZGF0YS5zZXJpZXNOYW1lICE9IFwiXCIpIHtcbiAgICAgICAgZmlsZVBhdGggPSBgJHt0aGlzLnNldHRpbmdzLmZvbGRlcn0vJHthYkpzb25EYXRhLmF1dGhvck5hbWVMRn0vJHtib29rLm1ldGFkYXRhLnNlcmllc05hbWUucmVwbGFjZSgvXFxzKyNcXGQrJC8sIFwiXCIpLnRyaW0oKX0vJHtzYW5pdGl6ZWRUaXRsZX0ubWRgO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmlsZVBhdGggPSBgJHt0aGlzLnNldHRpbmdzLmZvbGRlcn0vJHthYkpzb25EYXRhLmF1dGhvck5hbWVMRn0vJHtzYW5pdGl6ZWRUaXRsZX0ubWRgO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChmaWxlUGF0aCkpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5lbnN1cmVGb2xkZXJFeGlzdHMoZmlsZVBhdGgpO1xuICAgICAgICBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGUoZmlsZVBhdGgsIHRoaXMuZ2V0Qm9va1RlbXBsYXRlKGFiSnNvbkRhdGEpKVxuICAgICAgICAvLyBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGUoZmlsZVBhdGgsIEpTT04uc3RyaW5naWZ5KGJvb2ssIG51bGwsIDIpKTtcbiAgICAgICAgY29uc29sZS5sb2coYENyZWF0ZWQ6ICR7ZmlsZVBhdGh9YCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhgU2tpcHBlZDogJHtmaWxlUGF0aH0gKEFscmVhZHkgZXhpc3RzKWApO1xuICAgICAgfVxuICAgIH1cbiAgICAgIG5ldyBOb3RpY2UoXCJCb29rcyBmZXRjaGVkIGFuZCBub3RlcyBjcmVhdGVkIHN1Y2Nlc3NmdWxseSFcIik7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBmZXRjaGluZyBib29rczpcIiwgZXJyb3IsIFwiIGZyb20gXCIsIGFwaVVybCk7XG4gICAgICBuZXcgTm90aWNlKFwiRmFpbGVkIHRvIGZldGNoIGJvb2tzLiBDaGVjayB0aGUgY29uc29sZSBmb3IgZGV0YWlscy5cIik7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZW5zdXJlRm9sZGVyRXhpc3RzKGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgICBjb25zdCBmb2xkZXJQYXRoID0gZmlsZVBhdGguc3Vic3RyaW5nKDAsIGZpbGVQYXRoLmxhc3RJbmRleE9mKFwiL1wiKSk7XG4gIFxuICAgIGlmICghZm9sZGVyUGF0aCkgcmV0dXJuO1xuICBcbiAgICBjb25zdCBmb2xkZXIgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoZm9sZGVyUGF0aCk7XG4gICAgaWYgKCFmb2xkZXIpIHtcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNyZWF0ZUZvbGRlcihmb2xkZXJQYXRoKTtcbiAgICAgIGNvbnNvbGUubG9nKGBDcmVhdGVkIGZvbGRlcjogJHtmb2xkZXJQYXRofWApO1xuICAgIH1cbiAgfVxuXG4gIGdldEJvb2tUZW1wbGF0ZShhYkpzb25EYXRhKSB7XG4gICAgcmV0dXJuIGAke3RoaXMuc2V0dGluZ3MudGVtcGxhdGV9YFxuICAgICAgLnJlcGxhY2UoL3t7KC4qPyl9fS9nLCAoXywga2V5KSA9PiB7XG4gICAgICAgIHJldHVybiBhYkpzb25EYXRhW2tleS50cmltKCldIHx8IFwiXCI7XG4gICAgICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCkge1xuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gIH1cbn1cblxuY2xhc3MgQUJTUGx1Z2luU2V0dGluZ1RhYiBleHRlbmRzIFBsdWdpblNldHRpbmdUYWIge1xuICBwbHVnaW46IEFCU1BsdWdpbjtcblxuICBjb25zdHJ1Y3RvcihhcHAsIHBsdWdpbikge1xuICAgIHN1cGVyKGFwcCwgcGx1Z2luKTtcbiAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcbiAgfVxuXG4gIGRpc3BsYXkoKSB7XG4gICAgY29uc3QgeyBjb250YWluZXJFbCB9ID0gdGhpcztcbiAgICBjb250YWluZXJFbC5lbXB0eSgpO1xuXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoXCJoMlwiLCB7IHRleHQ6IFwiQUJTIFBsdWdpbiBTZXR0aW5nc1wiIH0pO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZShcIkFQSSBIb3N0XCIpXG4gICAgICAuc2V0RGVzYyhcIkVudGVyIHRoZSBiYXNlIFVSTCBvZiB0aGUgQVBJICh3aXRob3V0IGh0dHBzOi8vKVwiKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoXCJleGFtcGxlLmFicy5vcmdcIilcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuaG9zdClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5ob3N0ID0gdmFsdWUudHJpbSgpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKFwiTGlicmFyeVwiKVxuICAgICAgLnNldERlc2MoXCJFbnRlciB0aGUgbGlicmFyeSBJRCBvciBuYW1lXCIpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcImF1ZGlvYm9va3NcIilcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MubGlicmFyeSlcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5saWJyYXJ5ID0gdmFsdWUudHJpbSgpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKFwiQVBJIFRva2VuXCIpXG4gICAgICAuc2V0RGVzYyhcIkVudGVyIHlvdXIgQVBJIHRva2VuXCIpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcInlvdXItdG9rZW4taGVyZVwiKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy50b2tlbilcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy50b2tlbiA9IHZhbHVlLnRyaW0oKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZShcIkZvbGRlclwiKVxuICAgICAgLnNldERlc2MoXCJXaGVyZSB0byBjcmVhdGUgcGFnZXMuXCIpXG4gICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkFCU1wiKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5mb2xkZXIpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZm9sZGVyID0gdmFsdWUudHJpbSgpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKFwiVGVtcGxhdGVcIilcbiAgICAgIC5zZXREZXNjKFwiVGVtcGxhdGUgZm9yIG5ldyBwYWdlcy5cIilcbiAgICAgIC5hZGRUZXh0QXJlYSgodGV4dCkgPT5cbiAgICAgICAgdGV4dFxuICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIjwhLS0hPlwiKVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy50ZW1wbGF0ZSlcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy50ZW1wbGF0ZSA9IHZhbHVlLnRyaW0oKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuICB9XG59XG5cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxzQkFBb0U7QUFVcEUsSUFBTSxtQkFBc0M7QUFBQSxFQUMxQyxNQUFNO0FBQUEsRUFDTixTQUFTO0FBQUEsRUFDVCxPQUFPO0FBQUEsRUFDUCxRQUFRO0FBQUEsRUFDUixVQUFVO0FBQ1o7QUFFQSxJQUFxQixZQUFyQixjQUF1Qyx1QkFBTztBQUFBLEVBRzVDLE1BQU0sZUFBZTtBQUNuQixTQUFLLFdBQVcsT0FBTztBQUFBLE1BQ3JCLENBQUM7QUFBQSxNQUNEO0FBQUEsTUFDQSxNQUFNLEtBQUssU0FBUztBQUFBLElBQ3RCO0FBQUEsRUFDRjtBQUFBLEVBRUEsTUFBTSxTQUFTO0FBQ2IsVUFBTSxLQUFLLGFBQWE7QUFFeEIsU0FBSyxjQUFjLElBQUksb0JBQW9CLEtBQUssS0FBSyxJQUFJLENBQUM7QUFFMUQsVUFBTSxlQUFlLEtBQUssY0FBYyxjQUFjLE9BQU8sTUFBTTtBQUNqRSxVQUFJLHVCQUFPLHdCQUF3QjtBQUNuQyxXQUFLLG9CQUFvQjtBQUFBLElBQzNCLENBQUM7QUFFRCxTQUFLLFdBQVc7QUFBQSxNQUNkLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLFVBQVUsWUFBWTtBQUNwQixjQUFNLEtBQUssb0JBQW9CO0FBQUEsTUFDakM7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFFQSxNQUFNLHNCQUFzQjtBQUMxQixRQUFJLENBQUMsS0FBSyxTQUFTLFFBQVEsQ0FBQyxLQUFLLFNBQVMsV0FBVyxDQUFDLEtBQUssU0FBUyxPQUFPO0FBQ3pFLFVBQUksdUJBQU8sMkRBQTJEO0FBQ3RFO0FBQUEsSUFDRjtBQUNBLFFBQUksQ0FBQyxL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
