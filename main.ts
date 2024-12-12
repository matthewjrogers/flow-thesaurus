import { App, Plugin, PluginSettingTab, Setting, WorkspaceLeaf } from 'obsidian';
import { FlowThesaurusView, VIEW_TYPE_FLOW_THESAURUS } from './flow-view';

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
      
        this.addRibbonIcon('dice', 'Activate view', () => {
            this.activateView();
        });

        this.addSettingTab(new SampleSettingTab(this.app, this));
    }

    onunload() {}

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