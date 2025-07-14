// Global variables
let currentSearchTerm = '';
let currentResults = null;
let typingTimeouts = [];
let isTypingInProgress = false;
let comparisonTypingComplete = false;
let comparisonDataLoaded = false;

// DOM elements
const itemInput = document.getElementById('itemInput');
const searchBtn = document.getElementById('searchBtn');
const loadingState = document.getElementById('loadingState');
const resultsSection = document.getElementById('resultsSection');
const originalItemDetails = document.getElementById('originalItemDetails');
const alternativesList = document.getElementById('alternativesList');
const comparisonModal = new bootstrap.Modal(document.getElementById('comparisonModal'), {
    keyboard: true,
    backdrop: true // Allow closing by clicking outside
});
const comparisonContent = document.getElementById('comparisonContent');

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Search button click
    searchBtn.addEventListener('click', handleSearch);
    
    // Enter key press in input
    itemInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Auto-focus on input
    itemInput.focus();
    
    // Modal event listeners
    document.getElementById('comparisonModal').addEventListener('hidden.bs.modal', function() {
        clearComparisonTimeouts();
        clearAllTypingTimeouts();
        comparisonContent.innerHTML = '';
    });
});

// Clear all typing timeouts
function clearAllTypingTimeouts() {
    typingTimeouts.forEach(timeout => clearTimeout(timeout));
    typingTimeouts = [];
    isTypingInProgress = false;
}

// Handle search functionality
async function handleSearch() {
    const itemName = itemInput.value.trim();
    
    if (!itemName) {
        showError('Please enter a product name');
        return;
    }
    
    currentSearchTerm = itemName;
    showLoadingState();
    
    try {
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ item_name: itemName })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            showError(data.error);
            return;
        }
        
        currentResults = data;
        displayResults(data);
        
    } catch (error) {
        console.error('Search error:', error);
        showError('Failed to search for alternatives. Please check your internet connection and try again.');
    } finally {
        hideLoadingState();
    }
}

// Enhanced loading state with quantum particles
function showLoadingState() {
    searchBtn.disabled = true;
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Finding...</span>';
    
    const loadingMessages = [
        "Initializing AI analysis...",
        "Scanning product database...",
        "Analyzing alternatives...",
        "Calculating compatibility...",
        "Preparing results..."
    ];
    
    let messageIndex = 0;
    
    loadingState.innerHTML = `
        <div class="loading-spinner">
            <div class="quantum-loader">
                <div class="quantum-core"></div>
                <div class="quantum-ring"></div>
                <div class="quantum-ring"></div>
                <div class="quantum-ring"></div>
                <div class="quantum-particles">
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                </div>
            </div>
            <p class="loading-text" id="loadingMessage">${loadingMessages[0]}</p>
            <div class="progress-bar-container">
                <div class="progress-bar"></div>
            </div>
            <p class="loading-details">Please wait while we analyze your product...</p>
        </div>
    `;
    
    // Cycle through loading messages
    const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        const messageElement = document.getElementById('loadingMessage');
        if (messageElement) {
            messageElement.textContent = loadingMessages[messageIndex];
        }
    }, 1200);
    
    // Store interval to clear it later
    loadingState.messageInterval = messageInterval;
    
    loadingState.style.display = 'block';
    resultsSection.style.display = 'none';
}

// Hide loading state
function hideLoadingState() {
    searchBtn.disabled = false;
    searchBtn.innerHTML = '<i class="fas fa-search"></i> <span>Find Alternatives</span>';
    
    // Clear message interval if it exists
    if (loadingState.messageInterval) {
        clearInterval(loadingState.messageInterval);
        loadingState.messageInterval = null;
    }
    
    loadingState.style.display = 'none';
}

// Display search results with enhanced animations
function displayResults(data) {
    if (!data.original_item || !data.alternatives) {
        showError('Invalid response format from server');
        return;
    }
    
    // Clear any existing timeouts
    clearAllTypingTimeouts();
    
    // Display original item details with typing effect
    displayOriginalItemWithTyping(data.original_item);
    
    // Display alternatives with staggered typing effect
    displayAlternativesWithTyping(data.alternatives);
    
    // Show results section with animation
    resultsSection.style.display = 'block';
    
    // Scroll to results
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }, 500);
}

// Display original item with typing animation
function displayOriginalItemWithTyping(item) {
    // Clear any previous typed status
    originalItemDetails.querySelectorAll('[data-typed]').forEach(el => {
        el.removeAttribute('data-typed');
        el.removeAttribute('data-typing');
    });
    
    const detailsHTML = `
        <div class="original-details">
            <div class="detail-item">
                <div class="detail-label">Product Name</div>
                <div class="detail-value typewriter-element" data-text="${escapeHtml(item.name)}"></div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Category</div>
                <div class="detail-value typewriter-element" data-text="${escapeHtml(item.category || 'N/A')}"></div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Price (INR)</div>
                <div class="detail-value typewriter-element" data-text="${escapeHtml(item.price_inr || 'N/A')}"></div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Availability</div>
                <div class="detail-value typewriter-element" data-text="${escapeHtml(item.availability || 'N/A')}"></div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Performance</div>
                <div class="detail-value typewriter-element" data-text="${escapeHtml(item.performance || 'N/A')}"></div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Primary Usage</div>
                <div class="detail-value typewriter-element" data-text="${escapeHtml(item.usage || 'N/A')}"></div>
            </div>
        </div>
        ${item.description ? `
            <div class="mt-4">
                <h6><i class="fas fa-info-circle"></i> Description</h6>
                <p class="text-muted typewriter-element" data-text="${escapeHtml(item.description)}"></p>
            </div>
        ` : ''}
    `;
    
    originalItemDetails.innerHTML = detailsHTML;
    
    // Start typing animation for original item details
    setTimeout(() => {
        startTypingAnimation(originalItemDetails);
    }, 300);
}

// Display alternatives with staggered typing effect
function displayAlternativesWithTyping(alternatives) {
    if (!alternatives || alternatives.length === 0) {
        alternativesList.innerHTML = '<p class="text-center text-muted">No alternatives found.</p>';
        return;
    }
    
    // Create container with hidden content first
    const alternativesHTML = alternatives.map((alt, index) => `
        <div class="alternative-item" style="animation-delay: ${(index + 1) * 0.2}s" data-index="${index}">
            <div class="alternative-header">
                <h5 class="alternative-name typewriter-element" data-text="${escapeHtml(alt.name)}"></h5>
                <span class="alternative-category typewriter-element" data-text="${escapeHtml(alt.category || 'General')}"></span>
            </div>
            <p class="alternative-description typewriter-element" data-text="${escapeHtml(alt.description || 'No description available')}"></p>
            <div class="alternative-details">
                <div class="alternative-detail">
                    <strong>Price:</strong> <span class="typewriter-element" data-text="${escapeHtml(alt.price_inr || 'N/A')}"></span>
                </div>
                <div class="alternative-detail">
                    <strong>Availability:</strong> <span class="typewriter-element" data-text="${escapeHtml(alt.availability || 'N/A')}"></span>
                </div>
                <div class="alternative-detail">
                    <strong>Performance:</strong> <span class="typewriter-element" data-text="${escapeHtml(alt.performance || 'N/A')}"></span>
                </div>
                <div class="alternative-detail">
                    <strong>Compatibility:</strong> <span class="typewriter-element" data-text="${escapeHtml(alt.compatibility || 'N/A')}"></span>
                </div>
            </div>
            <button class="compare-btn" onclick="handleCompareClick('${escapeHtml(alt.name)}')">
                <i class="fas fa-balance-scale"></i>
                Compare with Original
            </button>
        </div>
    `).join('');
    
    alternativesList.innerHTML = alternativesHTML;
    
    // Clear any previous typed status for alternatives
    alternativesList.querySelectorAll('[data-typed]').forEach(el => {
        el.removeAttribute('data-typed');
        el.removeAttribute('data-typing');
    });
    
    // Start staggered typing animation for alternatives
    setTimeout(() => {
        const alternativeItems = alternativesList.querySelectorAll('.alternative-item');
        alternativeItems.forEach((item, index) => {
            setTimeout(() => {
                startTypingAnimation(item);
                // Add click handler after typing is complete
                setTimeout(() => {
                    item.style.cursor = 'pointer';
                    item.addEventListener('click', () => {
                        const nameElement = item.querySelector('.alternative-name');
                        if (nameElement) {
                            handleCompareClick(nameElement.textContent);
                        }
                    });
                }, 500);
            }, index * 100);
        });
    }, 200);
}

// Enhanced typing animation function with single execution
function startTypingAnimation(container) {
    if (isTypingInProgress) return;
    
    const typewriterElements = container.querySelectorAll('.typewriter-element:not([data-typed]):not([data-typing])');
    
    typewriterElements.forEach((element, index) => {
        const text = element.getAttribute('data-text');
        if (!text) return;
        
        // Mark as being typed
        element.setAttribute('data-typing', 'true');
        element.textContent = '';
        
        const timeout = setTimeout(() => {
            typeText(element, text, () => {
                // Mark as completed
                element.setAttribute('data-typed', 'true');
                element.removeAttribute('data-typing');
            });
        }, index * 50);
        
        typingTimeouts.push(timeout);
    });
}

// Type text character by character with fast speed
function typeText(element, text, callback) {
    let currentIndex = 0;
    const typingSpeed = 8; // fast typing - 8ms per character
    
    function typeNextChar() {
        if (currentIndex < text.length) {
            element.textContent += text.charAt(currentIndex);
            currentIndex++;
            
            const timeout = setTimeout(typeNextChar, typingSpeed);
            typingTimeouts.push(timeout);
        } else {
            if (callback) callback();
        }
    }
    
    typeNextChar();
}

// Handle compare button click
async function handleCompareClick(alternativeName) {
    if (!currentSearchTerm) {
        showError('Original item not found');
        return;
    }
    
    // Reset comparison states
    clearComparisonTimeouts();
    clearAllTypingTimeouts();
    
    // Show modal first with loading animation
    comparisonModal.show();
    showComparisonLoading(alternativeName);
    
    try {
        const response = await fetch('/api/compare', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                original_item: currentSearchTerm,
                alternative_item: alternativeName
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response data:', data);
        
        if (data.error) {
            showComparisonError(data.error);
            return;
        }
        
        displayComparison(data);
        
    } catch (error) {
        console.error('Compare error:', error);
        showComparisonError('Failed to generate comparison. Please try again.');
    }
}

// Show comparison loading with quantum particles
function showComparisonLoading(alternativeName) {
    const loadingMessages = [
        "Analyzing original product...",
        "Evaluating alternative...",
        "Comparing specifications...",
        "Calculating differences...",
        "Generating insights..."
    ];
    
    let messageIndex = 0;
    
    comparisonContent.innerHTML = `
        <div class="comparison-loading">
            <div class="quantum-loader">
                <div class="quantum-core"></div>
                <div class="quantum-ring"></div>
                <div class="quantum-ring"></div>
                <div class="quantum-ring"></div>
                <div class="quantum-particles">
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                </div>
            </div>
            <p class="loading-text" id="comparisonLoadingMessage">${loadingMessages[0]}</p>
            <div class="progress-bar-container">
                <div class="progress-bar"></div>
            </div>
            <p class="loading-details">Comparing with ${escapeHtml(alternativeName)}...</p>
        </div>
    `;
    
    // Cycle through loading messages
    const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        const messageElement = document.getElementById('comparisonLoadingMessage');
        if (messageElement) {
            messageElement.textContent = loadingMessages[messageIndex];
        }
    }, 1000);
    
    // Store interval to clear it later
    comparisonContent.messageInterval = messageInterval;
}

// Display comparison results with typing effect
function displayComparison(data) {
    // Prevent multiple executions
    if (comparisonDataLoaded) {
        return;
    }
    comparisonDataLoaded = true;
    
    // Clear loading interval
    if (comparisonContent.messageInterval) {
        clearInterval(comparisonContent.messageInterval);
        comparisonContent.messageInterval = null;
    }
    
    // Clear any previous typing timeouts
    clearAllTypingTimeouts();
    
    const comparisonHTML = `
        <div class="comparison-grid">
            <div class="comparison-item">
                <h5 class="text-primary mb-3">
                    <i class="fas fa-star"></i> Original Product
                </h5>
                <h6 class="typewriter-element" data-text="${escapeHtml(data.original.name)}"></h6>
                <p class="text-muted typewriter-element" data-text="${escapeHtml(data.original.description)}"></p>
                
                <div class="mt-3">
                    <div class="mb-2">
                        <strong>Price:</strong> <span class="typewriter-element" data-text="${escapeHtml(data.original.price_inr)}"></span>
                    </div>
                    <div class="mb-2">
                        <strong>Availability:</strong> <span class="typewriter-element" data-text="${escapeHtml(data.original.availability)}"></span>
                    </div>
                    <div class="mb-2">
                        <strong>Performance Score:</strong> <span class="typewriter-element" data-text="${escapeHtml(data.original.performance_score)}"></span>
                    </div>
                </div>
                
                <div class="mt-3">
                    <h6 class="text-success">Pros:</h6>
                    <ul class="pros-list">
                        ${data.original.pros.map(pro => `
                            <li class="typewriter-element" data-text="• ${escapeHtml(pro)}"></li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="mt-3">
                    <h6 class="text-danger">Cons:</h6>
                    <ul class="cons-list">
                        ${data.original.cons.map(con => `
                            <li class="typewriter-element" data-text="• ${escapeHtml(con)}"></li>
                        `).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="comparison-item">
                <h5 class="text-warning mb-3">
                    <i class="fas fa-exchange-alt"></i> Alternative Product
                </h5>
                <h6 class="typewriter-element" data-text="${escapeHtml(data.alternative.name)}"></h6>
                <p class="text-muted typewriter-element" data-text="${escapeHtml(data.alternative.description)}"></p>
                
                <div class="mt-3">
                    <div class="mb-2">
                        <strong>Price:</strong> <span class="typewriter-element" data-text="${escapeHtml(data.alternative.price_inr)}"></span>
                    </div>
                    <div class="mb-2">
                        <strong>Availability:</strong> <span class="typewriter-element" data-text="${escapeHtml(data.alternative.availability)}"></span>
                    </div>
                    <div class="mb-2">
                        <strong>Performance Score:</strong> <span class="typewriter-element" data-text="${escapeHtml(data.alternative.performance_score)}"></span>
                    </div>
                </div>
                
                <div class="mt-3">
                    <h6 class="text-success">Pros:</h6>
                    <ul class="pros-list">
                        ${data.alternative.pros.map(pro => `
                            <li class="typewriter-element" data-text="• ${escapeHtml(pro)}"></li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="mt-3">
                    <h6 class="text-danger">Cons:</h6>
                    <ul class="cons-list">
                        ${data.alternative.cons.map(con => `
                            <li class="typewriter-element" data-text="• ${escapeHtml(con)}"></li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="comparison-summary">
            <h6><i class="fas fa-chart-line"></i> Comparison Summary</h6>
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-2">
                        <strong>Cost Difference:</strong> <span class="typewriter-element" data-text="${escapeHtml(data.comparison.cost_difference)}"></span>
                    </div>
                    <div class="mb-2">
                        <strong>Performance:</strong> <span class="typewriter-element" data-text="${escapeHtml(data.comparison.performance_difference)}"></span>
                    </div>
                    <div class="mb-2">
                        <strong>Availability:</strong> <span class="typewriter-element" data-text="${escapeHtml(data.comparison.availability_difference)}"></span>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-2">
                        <strong>Compatibility:</strong> <span class="typewriter-element" data-text="${escapeHtml(data.comparison.compatibility_analysis)}"></span>
                    </div>
                    <div class="mb-2">
                        <strong>Recommendation:</strong> <span class="typewriter-element" data-text="${escapeHtml(data.comparison.recommendation)}"></span>
                    </div>
                </div>
            </div>
            
            <div class="mt-3">
                <h6>Key Differences:</h6>
                <ul class="key-differences">
                    ${data.comparison.key_differences.map(diff => `
                        <li class="typewriter-element" data-text="• ${escapeHtml(diff)}"></li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `;
    
    comparisonContent.innerHTML = comparisonHTML;
    
    // Start typing animation for comparison content with delay to prevent double execution
    setTimeout(() => {
        if (!comparisonTypingComplete) {
            startComparisonTyping();
        }
    }, 300);
}

// Show comparison error
function showComparisonError(message) {
    comparisonContent.innerHTML = `
        <div class="text-center p-4">
            <div class="text-danger mb-3">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
            </div>
            <h5 class="text-danger">Comparison Failed</h5>
            <p class="text-muted">${escapeHtml(message)}</p>
            <button class="btn btn-primary" onclick="comparisonModal.hide()">
                <i class="fas fa-times"></i> Close
            </button>
        </div>
    `;
}

// Show error message
function showError(message) {
    const errorHTML = `
        <div class="alert alert-danger d-flex align-items-center" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            <div>${escapeHtml(message)}</div>
        </div>
    `;
    
    // Create temporary error container
    const errorContainer = document.createElement('div');
    errorContainer.innerHTML = errorHTML;
    errorContainer.className = 'error-container';
    
    // Insert after search section
    const searchCard = document.querySelector('.form-card');
    searchCard.parentNode.insertBefore(errorContainer, searchCard.nextSibling);
    
    // Remove error after 5 seconds
    setTimeout(() => {
        if (errorContainer.parentNode) {
            errorContainer.parentNode.removeChild(errorContainer);
        }
    }, 5000);
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Enhanced Animation Controls
function clearComparisonTimeouts() {
    if (comparisonContent.messageInterval) {
        clearInterval(comparisonContent.messageInterval);
        comparisonContent.messageInterval = null;
    }
    comparisonTypingComplete = false;
    comparisonDataLoaded = false;
}

// Enhanced typing animation for comparison with proper state management
function startComparisonTyping() {
    if (comparisonTypingComplete) return;
    
    comparisonTypingComplete = true;
    const typewriterElements = comparisonContent.querySelectorAll('.typewriter-element:not([data-typed]):not([data-typing])');
    
    typewriterElements.forEach((element, index) => {
        const text = element.getAttribute('data-text');
        if (!text) return;
        
        element.setAttribute('data-typing', 'true');
        element.textContent = '';
        
        const timeout = setTimeout(() => {
            typeText(element, text, () => {
                element.setAttribute('data-typed', 'true');
                element.removeAttribute('data-typing');
            });
        }, index * 40);
        
        typingTimeouts.push(timeout);
    });
}
