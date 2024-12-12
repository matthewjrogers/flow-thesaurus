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
    container.createEl('h4', { text: 'Flow Thesaurus' });

    // Create a toggle slider
    const toggleContainer = container.createEl('div', { cls: 'toggle-container' });
    const toggleLabel = toggleContainer.createEl('label', { cls: 'switch' });
    const toggleInput = toggleLabel.createEl('input', { type: 'checkbox' });
    const toggleSlider = toggleLabel.createEl('span', { cls: 'slider round' });

    let isDictionary = false;

    toggleInput.addEventListener('change', () => {
      isDictionary = toggleInput.checked;
      console.log('Dictionary Mode:', isDictionary);
    });

    // Create a text input with an in-line submit button
    const formContainer = container.createEl('div', { cls: 'form-container' });
    const inputField = formContainer.createEl('input', { type: 'text', cls: 'text-input' });
    const submitButton = formContainer.createEl('button', { text: 'Submit', cls: 'submit-button' });

    const resultsDiv = container.createEl('div', { cls: 'results' });

    submitButton.addEventListener('click', async () => {
      const inputValue = inputField.value.trim();
      if (!inputValue) {
        new Notice('Please enter a word.');
        return;
      }

      const apiUrl = isDictionary ? this.settings.dictionary_api_url : this.settings.synonym_api_url;
      const apiKey = isDictionary ? this.settings.dictionary_key : this.settings.thesaurus_key;
      const url = `${apiUrl}${inputValue}?key=${apiKey}`;
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
        if (isDictionary) {
          renderDictionaryResults(data, resultsDiv, inputValue);
        } else {
          renderThesaurusResults(data, resultsDiv);
        }
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

function renderThesaurusResults(data: any[], resultsDiv: HTMLDivElement) {
  resultsDiv.empty();  // Clear previous results

  // Check if the data returned is a list of suggested words
  if (Array.isArray(data) && typeof data[0] === 'string') {
    console.log('Suggested words:', data);
    const suggestionHeader = document.createElement('h3');
    suggestionHeader.innerText = 'Word not found. Did you mean...?';
    resultsDiv.appendChild(suggestionHeader);

    const suggestionList = document.createElement('ul');
    data.forEach(suggestion => {
      const listItem = document.createElement('li');
      listItem.innerText = suggestion;
      suggestionList.appendChild(listItem);
    });
    resultsDiv.appendChild(suggestionList);
    return;
  }

  data.forEach(entry => {
    const entryDiv = document.createElement('div');
    entryDiv.classList.add('entry');

    // Header
    const header = document.createElement('h2');
    header.innerText = entry.meta.id;
    entryDiv.appendChild(header);

    // Synonyms
    const synonyms = entry.meta.syns ? entry.meta.syns.flat() : [];
    const synHeader = document.createElement('h3');
    synHeader.innerText = 'Synonyms:';
    entryDiv.appendChild(synHeader);
    entryDiv.innerHTML += synonyms.length > 0 ? `<p>${synonyms.join(', ')}</p>` : '<p>None</p>';

    // Antonyms
    const antonyms = entry.meta.ants ? entry.meta.ants.flat() : [];
    const antHeader = document.createElement('h3');
    antHeader.innerText = 'Antonyms:';
    entryDiv.appendChild(antHeader);
    entryDiv.innerHTML += antonyms.length > 0 ? `<p>${antonyms.join(', ')}</p>` : '<p>None</p>';

    const defHeader = document.createElement('h3');
    defHeader.innerText = 'Sense of:';
    // Definitions and Senses
    entry.def.forEach((def: { sseq: any[]; }) => {
      let count = 0;
      def.sseq.forEach(sseqItem => {
        const senseData = sseqItem.find((item: string[]) => item[0] === "sense");
        if (senseData) {
          const senseDiv = renderSense(senseData[1]);
          entryDiv.appendChild(senseDiv);
          count++;
        }
      });
    });

    resultsDiv.appendChild(entryDiv);
  });
}

function renderDictionaryResults(data: any[], resultsDiv: HTMLDivElement, searchWord: string) {
  resultsDiv.empty();  // Clear previous results

  // Check if the data returned is a list of suggested words
  if (Array.isArray(data) && typeof data[0] === 'string') {
    console.log('Suggested words:', data);
    const suggestionHeader = document.createElement('h3');
    suggestionHeader.innerText = 'Word not found. Did you mean...?';
    resultsDiv.appendChild(suggestionHeader);

    const suggestionList = document.createElement('ul');
    data.forEach(suggestion => {
      const listItem = document.createElement('li');
      listItem.innerText = suggestion;
      suggestionList.appendChild(listItem);
    });
    resultsDiv.appendChild(suggestionList);
    return;
  }

  data.forEach(entry => {
    // Header with the search word and part of speech
    const header = document.createElement('h3');
    header.innerText = `${entry.hwi.hw} (${entry.fl})`;
    resultsDiv.appendChild(header);

    if (entry.shortdef && entry.shortdef.length > 0) {
      const shortdefList = document.createElement('ul');
      entry.shortdef.forEach((definition: string) => {
        if (definition.trim() !== "") {
          const listItem = document.createElement('li');
          listItem.innerText = definition;
          shortdefList.appendChild(listItem);
        }
      });
      resultsDiv.appendChild(shortdefList);
    }

    if (entry.def && entry.def.length > 0) {
      const defList = document.createElement('ul');
      entry.def.forEach((def: { sseq: any[]; }) => {
        const defItem = document.createElement('li');
        const nestedList = renderDef(def.sseq);
        if (nestedList.childElementCount > 0) {
          defItem.appendChild(nestedList);
          defList.appendChild(defItem);
        }
      });
      resultsDiv.appendChild(defList);
    }
  });
}

function renderDef(sseq: any[]): HTMLUListElement {
  const list = document.createElement('ul');
  sseq.forEach(sseqItem => {
    const item = sseqItem[0];
    if (item === "sense") {
      const sense = sseqItem[1];
      const listItem = document.createElement('li');
      if (sense.dt[0][1].trim() !== "") {
        listItem.innerText = sense.dt[0][1];
        list.appendChild(listItem);
      }
    } else if (item === "pseq" || item === "bs") {
      const nestedList = renderDef(sseqItem[1]);
      if (nestedList.childElementCount > 0) {
        list.appendChild(nestedList);
      }
    }
  });
  return list;
}

function renderSense(sense: { sn: any; dt: string[][]; }) {
  const senseDiv = document.createElement('div');
  senseDiv.classList.add('sense');

  // Add sense number if available
  if (sense.sn) {
    const senseNumber = document.createElement('span');
    senseNumber.classList.add('sense-number');
    senseNumber.innerText = `${sense.sn}. `;
    senseDiv.appendChild(senseNumber);
  }

  // Add definition text
  const definition = document.createElement('span');
  definition.classList.add('definition');
  if (sense.dt[0][1].trim() !== "") {
    definition.innerText = sense.dt[0][1];
    senseDiv.appendChild(definition);
  }

  return senseDiv;
}