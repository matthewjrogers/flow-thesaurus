import { ItemView, WorkspaceLeaf } from 'obsidian';

export const VIEW_TYPE_FLOW_THESAURUS = 'flow-thesaurus';

export class FlowThesaurusView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
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

    submitButton.addEventListener('click', () => {
      const inputValue = inputField.value;
      console.log('Submitted value:', inputValue);
      container.createEl('p', { text: inputValue });
      // Handle the submitted value as needed
    });
  }

  async onClose() {
    // Nothing to clean up.
  }
}