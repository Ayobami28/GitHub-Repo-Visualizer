// GitHub API configuration
const GITHUB_API_BASE = 'https://api.github.com';

// Function to calculate improvement score for repositories
function calculateImprovementScore(repo) {
  let score = 0;
  
  // Higher score = better maintained, lower score = needs improvement
  
  // Description adds points
  if (repo.description && repo.description.trim().length > 10) {
    score += 20;
  }
  
  // Topics add points
  if (repo.topics && repo.topics.length > 0) {
    score += repo.topics.length * 5; // 5 points per topic
  }
  
  // Stars add points (indicates popularity/maintenance)
  score += Math.min(repo.stargazers_count * 2, 50); // Cap at 50 points
  
  // Recent updates add points
  const daysSinceUpdate = (Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate < 30) {
    score += 30; // Very recent
  } else if (daysSinceUpdate < 90) {
    score += 20; // Recent
  } else if (daysSinceUpdate < 365) {
    score += 10; // Somewhat recent
  }
  // No points for very old repos
  
  // Language specified adds points
  if (repo.language && repo.language !== 'Not specified') {
    score += 10;
  }
  
  // License adds points (important for open source projects)
  if (repo.license && repo.license.name && repo.license.name !== 'No license') {
    score += 15;
  }
  
  // Forks indicate community interest
  score += Math.min(repo.forks_count * 1, 20); // Cap at 20 points
  
  // Private repos might need more attention (lower score)
  if (repo.private) {
    score -= 5;
  }
  
  return Math.max(score, 0); // Ensure non-negative
}

// Function to get user repositories directly from GitHub API
async function getUserRepos(token, includeForks = true) {
  const allRepos = [];
  let page = 1;
  const perPage = 100;
  
  try {
    while (true) {
      const url = `${GITHUB_API_BASE}/user/repos?type=all&per_page=${perPage}&sort=updated&direction=desc&page=${page}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }
      
      const repos = await response.json();
      if (!repos || repos.length === 0) break;
      
      for (const repo of repos) {
        if (!includeForks && repo.fork) continue;
        allRepos.push({
          owner: repo.owner.login,
          name: repo.name,
          fullName: repo.full_name,
          private: repo.private,
          description: repo.description || 'No description available',
          language: repo.language || 'Not specified',
          license: repo.license ? repo.license.name : 'No license',
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          updatedAt: new Date(repo.updated_at),
          createdAt: new Date(repo.created_at),
          url: repo.html_url,
          fork: repo.fork,
          topics: repo.topics || [],
          hasDescription: !!repo.description,
          hasTopics: !!(repo.topics && repo.topics.length > 0),
          hasLicense: !!(repo.license && repo.license.name),
          // Calculate improvement score (lower is better - needs more improvement)
          improvementScore: calculateImprovementScore(repo)
        });
      }
      
      if (repos.length < perPage) break;
      page++;
      if (page > 10) break; // Limit to 10 pages
    }
  } catch (error) {
    console.error('Error fetching repositories:', error);
    throw error;
  }
  
  return allRepos;
}

// Function to format date
function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Function to create repository card
function createRepoCard(repo) {
  const forkIcon = repo.fork ? '<i class="fork icon"></i>' : '';
  const privateIcon = repo.private ? '<i class="lock icon"></i>' : '';
  const languageIcon = repo.language !== 'Not specified' ? `<span class="ui mini label language-label">${repo.language}</span>` : '<span class="ui mini label no-language"><i class="code icon"></i>No language</span>';
  const licenseIcon = repo.hasLicense ? `<span class="ui mini label license-label">${repo.license}</span>` : '<span class="ui mini label no-license"><i class="balance scale icon"></i>No license</span>';
  
  // Create topics/tags display with enhanced styling
  const topicsDisplay = repo.topics && repo.topics.length > 0 
    ? `<div class="ui mini labels">
         ${repo.topics.slice(0, 3).map(topic => `<span class="ui mini label hashtag-label">#${topic}</span>`).join('')}
         ${repo.topics.length > 3 ? `<span class="ui mini label more-tags">+${repo.topics.length - 3} more</span>` : ''}
       </div>`
    : '<div class="ui mini label no-tags"><i class="tag icon"></i>No tags</div>';
  
  // Create description display
  const descriptionDisplay = repo.hasDescription 
    ? `<div class="description">${repo.description}</div>`
    : `<div class="description"><i class="info circle icon"></i>No description available</div>`;
  
  return `
    <article class="ui card" role="listitem">
      <div class="content">
        <header class="header">
          ${forkIcon}${privateIcon}
          <a href="${repo.url}" target="_blank" aria-label="View ${repo.fullName} on GitHub">${repo.fullName}</a>
        </header>
        <div class="meta">
          ${languageIcon}
          ${licenseIcon}
          <span class="date">Updated ${formatDate(repo.updatedAt)}</span>
        </div>
        ${descriptionDisplay}
        <div class="extra content">
          ${topicsDisplay}
        </div>
      </div>
      <div class="extra content">
        <span class="right floated" aria-label="${repo.stars} stars">
          <i class="star icon" aria-hidden="true"></i>
          ${repo.stars}
        </span>
        <span aria-label="${repo.forks} forks">
          <i class="fork icon" aria-hidden="true"></i>
          ${repo.forks}
        </span>
      </div>
    </article>
  `;
}

// Function to create repository table with Fomantic UI features
function createRepoTable(repos) {
  const tableRows = repos.map(repo => {
    const forkIcon = repo.fork ? '<i class="fork icon"></i>' : '';
    const privateIcon = repo.private ? '<i class="lock icon"></i>' : '';
    const languageBadge = repo.language !== 'Not specified' ? `<span class="ui mini label language-label">${repo.language}</span>` : '<span class="ui mini label no-language"><i class="code icon"></i>No language</span>';
    const licenseBadge = repo.hasLicense ? `<span class="ui mini label license-label">${repo.license}</span>` : '<span class="ui mini label no-license"><i class="balance scale icon"></i>No license</span>';
    
    // Create topics display for table with enhanced styling
    const topicsDisplay = repo.topics && repo.topics.length > 0 
      ? `<div class="ui mini labels">
           ${repo.topics.slice(0, 2).map(topic => `<span class="ui mini label hashtag-label">#${topic}</span>`).join('')}
           ${repo.topics.length > 2 ? `<span class="ui mini label more-tags">+${repo.topics.length - 2}</span>` : ''}
         </div>`
      : '<span class="ui mini label no-tags"><i class="tag icon"></i>No tags</span>';
    
    return `
      <tr data-repo='${JSON.stringify(repo)}'>
        <td>
          ${forkIcon}${privateIcon}
          <a href="${repo.url}" target="_blank" class="repo-link">${repo.fullName}</a>
          <br>
          <small class="text-muted">
            ${repo.hasDescription ? repo.description.substring(0, 50) + (repo.description.length > 50 ? '...' : '') : '<i class="info circle icon"></i>No description'}
          </small>
        </td>
        <td>${languageBadge}</td>
        <td>${licenseBadge}</td>
        <td>${topicsDisplay}</td>
        <td><i class="star icon"></i>${repo.stars}</td>
        <td><i class="fork icon"></i>${repo.forks}</td>
        <td>${formatDate(repo.updatedAt)}</td>
        <td>
          <div class="ui mini buttons">
            <button class="ui mini button" onclick="openRepoModal('${repo.fullName}')">
              <i class="eye icon"></i>
              Details
            </button>
            <a href="${repo.url}" target="_blank" class="ui mini button">
              <i class="external alternate icon"></i>
              View
            </a>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Get unique languages for filter dropdown
  const languages = [...new Set(repos.map(r => r.language).filter(l => l && l !== 'Not specified'))];
  const languageOptions = languages.map(lang => `<option value="${lang}">${lang}</option>`).join('');
  
  // Get unique topics for filter dropdown
  const allTopics = repos.flatMap(r => r.topics || []).filter(t => t);
  const uniqueTopics = [...new Set(allTopics)];
  const topicOptions = uniqueTopics.map(topic => `<option value="${topic}">#${topic}</option>`).join('');

  return `
      <section class="ui segment" aria-labelledby="repos-section">
      <h2 id="repos-section" class="ui header">
        <i class="github icon" aria-hidden="true"></i>
        <div class="content">
          Repositories (${repos.length})
          <p class="sub header">Click on repository names for details</p>
        </div>
      </h2>
      
      <!-- Copy JSON Button for Repositories Needing Improvements -->
      <div class="ui segment">
        <div class="ui grid">
          <div class="twelve wide column">
            <h4 class="ui header">
              <i class="copy icon"></i>
              <div class="content">Export Repositories Needing Improvements</div>
            </h4>
            <p>Copy JSON data for public repositories that need description and hashtag improvements (private repos are skipped)</p>
          </div>
          <div class="four wide column">
            <button class="ui primary button" id="copy-json-btn" onclick="copyReposNeedingImprovements()">
              <i class="copy icon"></i>
              Copy JSON
            </button>
          </div>
        </div>
      </div>
      
      <!-- Search and Filter Controls -->
      <div class="ui grid">
        <div class="six wide column">
          <div class="ui search">
            <div class="ui icon input">
              <input class="prompt" type="text" placeholder="Search repositories..." id="repo-search">
              <i class="search icon"></i>
            </div>
            <div class="results"></div>
          </div>
        </div>
        <div class="three wide column">
          <div class="ui selection dropdown" id="language-filter">
            <input type="hidden" name="language">
            <i class="dropdown icon"></i>
            <div class="default text">Filter by Language</div>
            <div class="menu">
              <div class="item" data-value="">All Languages</div>
              ${languageOptions}
            </div>
          </div>
        </div>
        <div class="three wide column">
          <div class="ui selection dropdown" id="topic-filter">
            <input type="hidden" name="topic">
            <i class="dropdown icon"></i>
            <div class="default text">Filter by Topic</div>
            <div class="menu">
              <div class="item" data-value="">All Topics</div>
              ${topicOptions}
            </div>
          </div>
        </div>
        <div class="four wide column">
          <div class="ui selection dropdown" id="sort-dropdown">
            <input type="hidden" name="sort">
            <i class="dropdown icon"></i>
            <div class="default text">Sort by</div>
            <div class="menu">
              <div class="item" data-value="updated">Last Updated</div>
              <div class="item" data-value="stars">Most Stars</div>
              <div class="item" data-value="forks">Most Forks</div>
              <div class="item" data-value="name">Name A-Z</div>
              <div class="item" data-value="license">License A-Z</div>
              <div class="item" data-value="improvements">Need Improvements (Desc)</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="ui styled accordion">
        <div class="title">
          <i class="dropdown icon" aria-hidden="true"></i>
          Table View
        </div>
        <div class="content">
          <div class="ui table">
            <table class="ui celled striped table" id="repo-table" role="table" aria-label="Repository table">
              <thead>
                <tr>
                  <th scope="col">Repository</th>
                  <th scope="col">Language</th>
                  <th scope="col">License</th>
                  <th scope="col">Topics</th>
                  <th scope="col">Stars</th>
                  <th scope="col">Forks</th>
                  <th scope="col">Updated</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="title">
          <i class="dropdown icon" aria-hidden="true"></i>
          Card View
        </div>
        <div class="content">
          <div class="ui cards" id="repo-cards" role="list" aria-label="Repository cards">
            ${repos.map(createRepoCard).join('')}
          </div>
        </div>
      </div>
    </section>
    
    <!-- Repository Details Modal -->
    <div class="ui modal" id="repo-modal" role="dialog" aria-labelledby="modal-header" aria-describedby="modal-content">
      <i class="close icon" aria-label="Close modal"></i>
      <header class="header" id="modal-header">
        Repository Details
      </header>
      <div class="content" id="modal-content">
        <!-- Content will be populated dynamically -->
      </div>
      <div class="actions">
        <div class="ui cancel button">Close</div>
        <a class="ui primary button" id="modal-github-link" target="_blank">
          <i class="github icon" aria-hidden="true"></i>
          View on GitHub
        </a>
      </div>
    </div>
  `;
}

// Function to load and display repositories
async function loadRepositories() {
  const token = document.getElementById('github-token').value.trim();
  
  if (!token) {
    $('.ui.message').remove();
    $('body').append(`
      <div class="ui negative message" role="alert" aria-live="polite">
        <i class="close icon" aria-label="Close message"></i>
        <h3 class="header">Error</h3>
        <p>Please enter your GitHub token</p>
      </div>
    `);
    return;
  }
  
  try {
    // Show loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('repo-list').innerHTML = '';
    
    // Fetch repositories
    const repos = await getUserRepos(token);
    
    // Hide loading
    document.getElementById('loading').style.display = 'none';
    
    if (repos.length === 0) {
      document.getElementById('repo-list').innerHTML = `
        <div class="ui info message" role="alert" aria-live="polite">
          <i class="info circle icon" aria-hidden="true"></i>
          <h3 class="header">No Repositories Found</h3>
          <p>No repositories found. Make sure your token has the correct permissions.</p>
        </div>
      `;
      return;
    }
    
    // Display repositories
    document.getElementById('repo-list').innerHTML = createRepoTable(repos);
    
    // Store repos globally for filtering/sorting
    window.currentRepos = repos;
    
    // Initialize Fomantic UI components
    initializeFomanticComponents();
    
    // Show success message
    $('.ui.message').remove();
    $('body').append(`
      <div class="ui success message" role="alert" aria-live="polite">
        <i class="close icon" aria-label="Close message"></i>
        <h3 class="header">Success!</h3>
        <p>Loaded ${repos.length} repositories</p>
      </div>
    `);
    
  } catch (error) {
    console.error('Error loading repositories:', error);
    document.getElementById('loading').style.display = 'none';
    document.getElementById('repo-list').innerHTML = `
      <div class="ui negative message" role="alert" aria-live="polite">
        <i class="close icon" aria-label="Close message"></i>
        <h3 class="header">Error</h3>
        <p>Failed to load repositories: ${error.message}</p>
      </div>
    `;
  }
}

// Initialize the page
function initializeApp() {
  if (typeof $ === 'undefined') {
    console.error('jQuery is not loaded');
    document.getElementById('repo-list').innerHTML = '<div class="ui negative message" role="alert"><h3 class="header">Error</h3><p>jQuery is not loaded. Please refresh the page.</p></div>';
    return;
  }
  
  $(document).ready(function() {
    console.log("GitHub Repo Visualizer loaded with Semantic UI");
    
    // Initialize message close functionality
    $(document).on('click', '.message .close', function() {
      $(this).closest('.message').transition('fade');
    });
  });
}

// Function to open repository details modal
function openRepoModal(repoName) {
  const repo = window.currentRepos.find(r => r.fullName === repoName);
  if (!repo) return;
  
  document.getElementById('modal-header').innerHTML = `
    <i class="github icon"></i>
    ${repo.fullName}
    ${repo.private ? '<i class="lock icon"></i>' : ''}
    ${repo.fork ? '<i class="fork icon"></i>' : ''}
  `;
  
  document.getElementById('modal-content').innerHTML = `
    <div class="ui grid">
      <div class="eight wide column">
        <h4 class="ui header">
          <i class="info circle icon"></i>
          <div class="content">Repository Information</div>
        </h4>
        <div class="ui list">
          <div class="item">
            <i class="user icon"></i>
            <div class="content">
              <div class="header">Owner</div>
              <div class="description">${repo.owner}</div>
            </div>
          </div>
          <div class="item">
            <i class="code icon"></i>
            <div class="content">
              <div class="header">Language</div>
              <div class="description">${repo.language || 'Not specified'}</div>
            </div>
          </div>
          <div class="item">
            <i class="balance scale icon"></i>
            <div class="content">
              <div class="header">License</div>
              <div class="description">${repo.license || 'No license'}</div>
            </div>
          </div>
          <div class="item">
            <i class="calendar icon"></i>
            <div class="content">
              <div class="header">Created</div>
              <div class="description">${formatDate(repo.createdAt)}</div>
            </div>
          </div>
          <div class="item">
            <i class="refresh icon"></i>
            <div class="content">
              <div class="header">Last Updated</div>
              <div class="description">${formatDate(repo.updatedAt)}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="eight wide column">
        <h4 class="ui header">
          <i class="chart bar icon"></i>
          <div class="content">Statistics</div>
        </h4>
        <div class="ui statistics">
          <div class="statistic">
            <div class="value">
              <i class="star icon"></i>
              ${repo.stars}
            </div>
            <div class="label">Stars</div>
          </div>
          <div class="statistic">
            <div class="value">
              <i class="fork icon"></i>
              ${repo.forks}
            </div>
            <div class="label">Forks</div>
          </div>
        </div>
        ${repo.description ? `
          <h4 class="ui header">
            <i class="file text icon"></i>
            <div class="content">Description</div>
          </h4>
          <p>${repo.description}</p>
        ` : `
          <h4 class="ui header">
            <i class="file text icon"></i>
            <div class="content">Description</div>
          </h4>
          <p><i class="info circle icon"></i>No description available for this repository</p>
        `}
        
        ${repo.topics && repo.topics.length > 0 ? `
          <h4 class="ui header">
            <i class="tags icon"></i>
            <div class="content">Topics</div>
          </h4>
          <div class="ui labels">
            ${repo.topics.map(topic => `<span class="ui label hashtag-label">#${topic}</span>`).join('')}
          </div>
        ` : `
          <h4 class="ui header">
            <i class="tags icon"></i>
            <div class="content">Topics</div>
          </h4>
          <p><i class="tag icon"></i>No topics assigned to this repository</p>
        `}
        
        <h4 class="ui header">
          <i class="chart line icon"></i>
          <div class="content">Improvement Score</div>
        </h4>
        <div class="ui progress" data-percent="${Math.round((repo.improvementScore / 100) * 100)}">
          <div class="bar">
            <div class="progress"></div>
          </div>
          <div class="label">${repo.improvementScore}/100 points</div>
        </div>
        <p><small>Higher scores indicate better maintained repositories</small></p>
      </div>
    </div>
  `;
  
  document.getElementById('modal-github-link').href = repo.url;
  
  $('#repo-modal').modal('show');
  
  // Initialize progress bar after modal is shown
  $('#repo-modal').modal({
    onShow: function() {
      $('.ui.progress').progress();
    }
  });
}

// Function to initialize Fomantic UI components
function initializeFomanticComponents() {
  // Initialize search
  $('.ui.search').search({
    source: window.currentRepos.map(repo => ({
      title: repo.fullName,
      description: repo.description || '',
      url: repo.url
    })),
    onSelect: function(result) {
      window.open(result.url, '_blank');
    }
  });
  
  // Initialize dropdowns
  $('.ui.dropdown').dropdown();
  
  // Initialize accordion
  $('.ui.accordion').accordion();
  
  // Initialize modal
  $('.ui.modal').modal();
  
  // Add search functionality
  $('#repo-search').on('input', function() {
    const searchTerm = $(this).val().toLowerCase();
    filterRepositories(searchTerm);
  });
  
  // Add topic filter functionality
  $('#topic-filter').dropdown({
    onChange: function(value) {
      filterRepositoriesByTopic(value);
    }
  });
  
  // Add language filter functionality
  $('#language-filter').dropdown({
    onChange: function(value) {
      filterRepositoriesByLanguage(value);
    }
  });
  
  // Add sort functionality
  $('#sort-dropdown').dropdown({
    onChange: function(value) {
      sortRepositories(value);
    }
  });
}

// Function to filter repositories by search term
function filterRepositories(searchTerm) {
  const rows = $('#repo-table tbody tr');
  const cards = $('#repo-cards .ui.card');
  
  rows.each(function() {
    const repoName = $(this).find('.repo-link').text().toLowerCase();
    const isVisible = repoName.includes(searchTerm);
    $(this).toggle(isVisible);
  });
  
  cards.each(function() {
    const repoName = $(this).find('.header a').text().toLowerCase();
    const isVisible = repoName.includes(searchTerm);
    $(this).toggle(isVisible);
  });
}

// Function to filter repositories by language
function filterRepositoriesByLanguage(language) {
  const rows = $('#repo-table tbody tr');
  const cards = $('#repo-cards .ui.card');
  
  rows.each(function() {
    const repoData = JSON.parse($(this).attr('data-repo'));
    const isVisible = !language || repoData.language === language;
    $(this).toggle(isVisible);
  });
  
  cards.each(function() {
    const repoName = $(this).find('.header a').text();
    const repo = window.currentRepos.find(r => r.fullName === repoName);
    const isVisible = !language || repo.language === language;
    $(this).toggle(isVisible);
  });
}

// Function to filter repositories by topic
function filterRepositoriesByTopic(topic) {
  const rows = $('#repo-table tbody tr');
  const cards = $('#repo-cards .ui.card');
  
  rows.each(function() {
    const repoData = JSON.parse($(this).attr('data-repo'));
    const isVisible = !topic || (repoData.topics && repoData.topics.includes(topic));
    $(this).toggle(isVisible);
  });
  
  cards.each(function() {
    const repoName = $(this).find('.header a').text();
    const repo = window.currentRepos.find(r => r.fullName === repoName);
    const isVisible = !topic || (repo.topics && repo.topics.includes(topic));
    $(this).toggle(isVisible);
  });
}

// Function to sort repositories
function sortRepositories(sortBy) {
  let sortedRepos = [...window.currentRepos];
  
  switch(sortBy) {
    case 'stars':
      sortedRepos.sort((a, b) => b.stars - a.stars);
      break;
    case 'forks':
      sortedRepos.sort((a, b) => b.forks - a.forks);
      break;
    case 'name':
      sortedRepos.sort((a, b) => a.fullName.localeCompare(b.fullName));
      break;
    case 'license':
      sortedRepos.sort((a, b) => a.license.localeCompare(b.license));
      break;
    case 'improvements':
      // Sort by improvement score ascending (lowest scores first = need most improvement)
      sortedRepos.sort((a, b) => a.improvementScore - b.improvementScore);
      break;
    case 'updated':
    default:
      sortedRepos.sort((a, b) => b.updatedAt - a.updatedAt);
      break;
  }
  
  // Update the display with sorted data
  window.currentRepos = sortedRepos;
  document.getElementById('repo-list').innerHTML = createRepoTable(sortedRepos);
  initializeFomanticComponents();
}

// Function to copy repositories that need improvements
function copyReposNeedingImprovements() {
  if (!window.currentRepos) {
    showMessage('error', 'No repositories loaded. Please load repositories first.');
    return;
  }
  
  // Filter repositories that need improvements in description and hashtags (skip private repos)
  const reposNeedingImprovements = window.currentRepos.filter(repo => {
    // Skip private repositories
    if (repo.private) {
      return false;
    }
    
    const needsDescription = !repo.hasDescription || (repo.description && repo.description.trim().length < 10);
    const needsHashtags = !repo.hasTopics || repo.topics.length === 0;
    
    return needsDescription || needsHashtags;
  });
  
  if (reposNeedingImprovements.length === 0) {
    showMessage('info', 'All public repositories have good descriptions and hashtags!');
    return;
  }
  
  // Create simplified JSON structure for easy processing
  const jsonData = {
    timestamp: new Date().toISOString(),
    totalReposNeedingImprovements: reposNeedingImprovements.length,
    repositories: reposNeedingImprovements.map(repo => ({
      fullName: repo.fullName,
      name: repo.name,
      owner: repo.owner,
      url: repo.url,
      description: repo.description,
      hasDescription: repo.hasDescription,
      needsDescription: !repo.hasDescription || (repo.description && repo.description.trim().length < 10),
      topics: repo.topics,
      hasTopics: repo.hasTopics,
      needsHashtags: !repo.hasTopics || repo.topics.length === 0,
      language: repo.language,
      license: repo.license,
      stars: repo.stars,
      forks: repo.forks,
      updatedAt: repo.updatedAt.toISOString(),
      createdAt: repo.createdAt.toISOString(),
      improvementScore: repo.improvementScore,
      private: repo.private,
      fork: repo.fork
    }))
  };
  
  // Copy to clipboard
  const jsonString = JSON.stringify(jsonData, null, 2);
  
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(jsonString).then(() => {
      showMessage('success', `Copied ${reposNeedingImprovements.length} public repositories needing improvements to clipboard!`);
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
      fallbackCopyTextToClipboard(jsonString);
    });
  } else {
    fallbackCopyTextToClipboard(jsonString);
  }
}

// Fallback copy function for older browsers
function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      showMessage('success', 'Copied public repositories needing improvements to clipboard!');
    } else {
      showMessage('error', 'Failed to copy to clipboard. Please try again.');
    }
  } catch (err) {
    console.error('Fallback copy failed:', err);
    showMessage('error', 'Failed to copy to clipboard. Please try again.');
  }
  
  document.body.removeChild(textArea);
}

// Function to show messages
function showMessage(type, message) {
  $('.ui.message').remove();
  const iconClass = type === 'success' ? 'check circle' : type === 'error' ? 'exclamation triangle' : 'info circle';
  $('body').append(`
    <div class="ui ${type} message" role="alert" aria-live="polite">
      <i class="close icon" aria-label="Close message"></i>
      <i class="${iconClass} icon" aria-hidden="true"></i>
      <div class="content">
        <div class="header">${type === 'success' ? 'Success!' : type === 'error' ? 'Error' : 'Info'}</div>
        <p>${message}</p>
      </div>
    </div>
  `);
  
  // Auto-remove success messages after 5 seconds
  if (type === 'success') {
    setTimeout(() => {
      $('.ui.success.message').transition('fade');
    }, 5000);
  }
}

// Wait for jQuery to load
if (typeof $ !== 'undefined') {
  initializeApp();
} else {
  // Wait a bit and try again
  setTimeout(function() {
    if (typeof $ !== 'undefined') {
      initializeApp();
    } else {
      console.error('jQuery failed to load');
      document.getElementById('repo-list').innerHTML = '<div class="ui negative message" role="alert"><h3 class="header">Error</h3><p>jQuery failed to load. Please check your internet connection and refresh the page.</p></div>';
    }
  }, 1000);
}
