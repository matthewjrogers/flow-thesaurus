import { App, Editor, MarkdownView, Modal, Notice, Menu, Plugin, PluginSettingTab, Setting, WorkspaceLeaf } from 'obsidian';
import { FlowThesaurusView, VIEW_TYPE_FLOW_THESAURUS } from 'flow-view';
// Remember to rename these classes and interfaces!

interface FlowThesaurusSettings {
	api_key: string;
	synonym_api_url: string;
	dictionary_api_url: string;
}

const DEFAULT_SETTINGS: FlowThesaurusSettings = {
	api_key: '',
	synonym_api_url: 'https://www.dictionaryapi.com/api/v3/references/thesaurus/json/',
	dictionary_api_url: 'https://www.dictionaryapi.com/api/v3/references/collegiate/json/'
}

export default class FlowThesaurusPlugin extends Plugin {
	settings: FlowThesaurusSettings;
	async activateView() {
		const { workspace } = this.app;
	
		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_FLOW_THESAURUS);
	
		if (leaves.length > 0) {
		  // A leaf with our view already exists, use that
		  leaf = leaves[0];
		} else {
		  // Our view could not be found in the workspace, create a new leaf
		  // in the right sidebar for it
		  leaf = workspace.getRightLeaf(false);
		  if (leaf) {
			await leaf.setViewState({ type: VIEW_TYPE_FLOW_THESAURUS, active: true });
		  }
		}
	
		// "Reveal" the leaf in case it is in a collapsed sidebar
		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	  }

	async onload() {
		await this.loadSettings();
		this.registerView(
			VIEW_TYPE_FLOW_THESAURUS,
			(leaf) => new FlowThesaurusView(leaf)
		  );
	  
		  this.addRibbonIcon('dice', 'Activate view', () => {
			this.activateView();
		  });

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: FlowThesaurusPlugin;

	constructor(app: App, plugin: FlowThesaurusPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
				
		new Setting(containerEl)
			.setName('API Key')
			.setDesc('Secret API key from Merriam-Webster API')
			.addText(text => text
				.setPlaceholder('Enter your API key')
				.setValue(this.plugin.settings.api_key)
				.onChange(async (value) => {
					this.plugin.settings.api_key = value;
					await this.plugin.saveSettings();
				}));
	}
}
