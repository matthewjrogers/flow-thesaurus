import { ItemView, WorkspaceLeaf, Notice } from 'obsidian';

export const VIEW_TYPE_FLOW_THESAURUS = 'flow-thesaurus';

export class FlowThesaurusView extends ItemView {
  settings: any;

  constructor(leaf: WorkspaceLeaf, settings: any) {
    super(leaf);
    this.settings = settings;
  }

  getViewType() {
    return VIEW_TYPE_FLOW_THESAURUS;
  }

  getDisplayText() {
    return 'Flow Thesaurus';
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl('h4', { text: 'Example view' });

    // Create a toggle slider
    const toggleContainer = container.createEl('div', { cls: 'toggle-container' });
    const toggleLabel = toggleContainer.createEl('label', { cls: 'switch' });
    const toggleInput = toggleLabel.createEl('input', { type: 'checkbox' });
    const toggleSlider = toggleLabel.createEl('span', { cls: 'slider round' });

    let isThesaurus = true;

    toggleInput.addEventListener('change', () => {
      isThesaurus = toggleInput.checked;
      // container.createEl('p', { text: isThesaurus ? 'Thesaurus view' : 'Dictionary view' });
    });

    // Initial view
    // container.createEl('p', { text: 'Thesaurus view' });

    // Create a text input with an in-line submit button
    const formContainer = container.createEl('div', { cls: 'form-container' });
    const inputField = formContainer.createEl('input', { type: 'text', cls: 'text-input' });
    const submitButton = formContainer.createEl('button', { text: 'Submit', cls: 'submit-button' });

    submitButton.addEventListener('click', async () => {
      const inputValue = inputField.value.trim();
      if (!inputValue) {
        new Notice('Please enter a word.');
        return;
      }

      const url = `${this.settings.synonym_api_url}${inputValue}?key=${this.settings.api_key}`;
      console.log('Fetching data from:', url);
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        const fileName = `${inputValue}.json`;
        await this.app.vault.create(fileName, JSON.stringify(data, null, 2));
        new Notice(`Response saved to ${fileName}`);
      } catch (error) {
        new Notice(`Failed to fetch data: ${error.message}`);
      }
    });

    // Example of using settings
    console.log('API Key:', this.settings.api_key);
  }

  async onClose() {
    // Nothing to clean up.
  }
}