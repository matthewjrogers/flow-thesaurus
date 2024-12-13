import { App, Plugin, PluginSettingTab, Setting, WorkspaceLeaf } from 'obsidian';
import { FlowThesaurusView, VIEW_TYPE_FLOW_THESAURUS } from './flow-view';

interface FlowThesaurusSettings {
    thesaurus_key: string;
	dictionary_key: string;
    synonym_api_url: string;
    dictionary_api_url: string;
}

const DEFAULT_SETTINGS: FlowThesaurusSettings = {
    thesaurus_key: '',
	dictionary_key: '',
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
          leaf = leaves[0];
        } else {
          leaf = workspace.getRightLeaf(false);
          if (leaf) {
            await leaf.setViewState({ type: VIEW_TYPE_FLOW_THESAURUS, active: true });
          }
        }
    
        if (leaf) {
            workspace.revealLeaf(leaf);
        }
    }

    async onload() {
        await this.loadSettings();
        this.registerView(
            VIEW_TYPE_FLOW_THESAURUS,
            (leaf) => new FlowThesaurusView(leaf, this.settings)
        );
      
        this.addRibbonIcon('book-type', 'Open Flow-Thesaurus', () => {
            this.activateView();
        });
        this.addCommand({
            id: 'open-flow-thesaurus',
            name: 'Open Flow-Thesaurus',
            callback: () => {
                this.activateView();
            },
        });

        this.addSettingTab(new FlowThesaurusSettingTab(this.app, this));
    }

    onunload() {}

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class FlowThesaurusSettingTab extends PluginSettingTab {
    plugin: FlowThesaurusPlugin;

    constructor(app: App, plugin: FlowThesaurusPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();
                
        new Setting(containerEl)
            .setName('Thesaurus API Key')
			.setDesc('Secret API key from Merriam-Webster API')
			.addText(text => text
                .setPlaceholder('Enter your API key')
                // .setValue(this.plugin.settings.thesaurus_key)
                .onChange(async (value) => {
                    this.plugin.settings.thesaurus_key = value;
                    await this.plugin.saveSettings();
                }));

		new Setting(containerEl)
				.setName('Dictionary API Key')
				.setDesc('Secret API key from Merriam-Webster API')
				.addText(text => text
					.setPlaceholder('Enter your API key')
					// .setValue(this.plugin.settings.dictionary_key)
					.onChange(async (value) => {
						this.plugin.settings.dictionary_key = value;
						await this.plugin.saveSettings();
					}));
        new Setting(containerEl)
                .setName('Dictionary URL')
                .setDesc('Select the Merriam-Webster dictionary you want to use (Default is Collegiate).')
                .addText(text => text
                    .setPlaceholder('Enter your API key')
                    .setValue(this.plugin.settings.dictionary_api_url)
                    .onChange(async (value) => {
                        this.plugin.settings.dictionary_api_url = value;
                        await this.plugin.saveSettings();
                    }));
        new Setting(containerEl)
                .setName('Thesaurus URL')
                .setDesc('Select the Merriam-Webster thesaurus you want to use.')
                .addText(text => text
                    .setPlaceholder('Enter your API key')
                    .setValue(this.plugin.settings.dictionary_api_url)
                    .onChange(async (value) => {
                        this.plugin.settings.dictionary_api_url = value;
                        await this.plugin.saveSettings();
                    }));
    }
}