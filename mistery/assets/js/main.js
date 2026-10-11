// ==========================================================================
// MAIN JAVASCRIPT LOGIC - Merriam-Webster Dictionary Search API Integration
// ==========================================================================

// Ensure DOM elements are fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
  
  // ------------------------------------------------------------------------
  // 1. DOM ELEMENT SELECTORS
  // ------------------------------------------------------------------------
  const searchBtn = document.getElementById('searchBtn');       // Search trigger button
  const wordInput = document.getElementById('wordInput');       // User input text field
  const resultsContainer = document.getElementById('results'); // Output container for definitions

  // ------------------------------------------------------------------------
  // 2. MERRIAM-WEBSTER API CONFIGURATION
  // ------------------------------------------------------------------------
  const API_KEY = "dbf7b472-86ad-4381-922a-ea9932b18df3";                               // Registered API key
  const API_URL = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/"; // Base Endpoint URL

  // ------------------------------------------------------------------------
  // 3. EVENT LISTENERS ATTACHMENT
  // ------------------------------------------------------------------------
  
  // Trigger search on button click
  searchBtn.addEventListener('click', fetchWordDefinition);

  // Trigger search when pressing 'Enter' key inside the text field
  wordInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      fetchWordDefinition();
    }
  });

  // ------------------------------------------------------------------------
  // 4. API FETCH FUNCTION
  // ------------------------------------------------------------------------
  function fetchWordDefinition() {
    // Sanitize input text by trimming whitespace
    const word = wordInput.value.trim();

    // Check for empty input string
    if (!word) {
      resultsContainer.innerHTML = '<p class="error-msg">Please enter a word to search.</p>';
      return;
    }

    // Render loading status to user
    resultsContainer.innerHTML = '<p>Loading...</p>';

    // Execute HTTP GET request to Merriam-Webster API
    fetch(`${API_URL}${encodeURIComponent(word)}?key=${API_KEY}`)
      .then((response) => {
        // Validate HTTP response status
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        // Check if API returned empty response or string suggestions array (word not found)
        if (!data || data.length === 0 || typeof data[0] === 'string') {
          resultsContainer.innerHTML = '<p class="error-msg">Word not found or no definition available.</p>';
        } else {
          // Process and render word details from response
          displayResults(data[0], word);
        }
      })
      .catch((error) => {
        // Catch network or fetch execution errors
        resultsContainer.innerHTML = '<p class="error-msg">Error fetching definition.</p>';
      });
  }

  // ------------------------------------------------------------------------
  // 5. RESULT RENDERING FUNCTION
  // ------------------------------------------------------------------------
  function displayResults(entry, searchedWord) {
    // Extract formatted word title (strip pronunciation wildcard markers like '*')
    const word = entry.hwi?.hw ? entry.hwi.hw.replace(/\*/g, '') : searchedWord;
    
    // Extract phonetic pronunciation reading from entry object
    const phonetic = entry.hwi?.prs?.[0]?.mw ? `\\ ${entry.hwi.prs[0].mw} \\` : '';
    
    // Extract grammatical part of speech (e.g., noun, verb, adjective)
    const partOfSpeech = entry.fl || '';

    let meaningsHTML = '';

    // Extract first short definition entry from array
    if (entry.shortdef && entry.shortdef.length > 0) {
      const firstDefinition = entry.shortdef[0];
      meaningsHTML = `
        <div class="meaning-block">
          ${partOfSpeech ? `<span class="part-of-speech">${partOfSpeech}</span>` : ''}
          <p class="definition">${firstDefinition}</p>
        </div>
      `;
    }

    // Inject generated HTML structure into results section
    resultsContainer.innerHTML = `
      <div class="word-header">
        <h2>${word}</h2>
        ${phonetic ? `<p class="phonetics">${phonetic}</p>` : ''}
      </div>
      ${meaningsHTML}
    `;
  }
});