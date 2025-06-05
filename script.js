// Textile Calculation - Fully Functional Static Website JavaScript

// Yarn Count System Types
const YarnCountSystems = {
  NE: "Ne",
  NM: "Nm",
  TEX: "Tex",
  DENIER: "Denier",
  LINEN: "Linen"
};

// Weave Types
const WeaveTypes = {
  PLAIN: "Plain",
  TWILL: "Twill",
  SATIN: "Satin"
};

// Yarn Count Conversion Functions

/**
 * Converts Ne to Nm using the formula: Ne × 1.693
 * @param ne English Cotton count
 * @returns Metric count
 */
function neToNm(ne) {
  return ne * 1.693;
}

/**
 * Converts Ne to Tex using the formula: 590.5 / Ne
 * @param ne English Cotton count
 * @returns Tex count
 */
function neToTex(ne) {
  return 590.5 / ne;
}

/**
 * Converts Ne to Denier using the formula: 5315 / Ne
 * @param ne English Cotton count
 * @returns Denier count
 */
function neToDenier(ne) {
  return 5315 / ne;
}

/**
 * Converts Ne to Linen (Lea) using the formula: Ne × 2.8
 * @param ne English Cotton count
 * @returns Linen count
 */
function neToLinen(ne) {
  return ne * 2.8;
}

/**
 * Converts yarn count to Tex
 * @param count The yarn count value
 * @param system The count system (Ne, Nm, Tex, Denier, Linen)
 * @returns The yarn count in Tex
 */
function convertToTex(count, system) {
  switch(system) {
    case YarnCountSystems.NE:
      // 1 NE = 590.5 / NE in Tex
      return 590.5 / count;
    case YarnCountSystems.NM:
      // 1 Nm = 1000 / Nm in Tex
      return 1000 / count;
    case YarnCountSystems.TEX:
      // Already in Tex
      return count;
    case YarnCountSystems.DENIER:
      // 1 Denier = Denier / 9 in Tex
      return count / 9;
    case YarnCountSystems.LINEN:
      // 1 Linen = 1653.5 / Linen in Tex
      return 1653.5 / count;
    default:
      return 0;
  }
}

/**
 * Converts yarn count from one system to all others based on the conversion table
 * @param count The yarn count value
 * @param system The current count system
 * @returns An object with converted values for all count systems
 */
function convertYarnCount(count, system) {
  // Convert to Tex first (as base unit)
  const texValue = convertToTex(count, system);
  
  // Then convert from Tex to all other systems
  return {
    [YarnCountSystems.NE]: 590.5 / texValue,
    [YarnCountSystems.NM]: 1000 / texValue,
    [YarnCountSystems.TEX]: texValue,
    [YarnCountSystems.DENIER]: texValue * 9,
    [YarnCountSystems.LINEN]: 1653.5 / texValue
  };
}

/**
 * Gets yarn count in all systems from length and weight
 * @param length Yarn length in meters
 * @param weight Weight in grams
 * @returns An object with values for all count systems
 */
function getYarnCountFromLengthAndWeight(length, weight) {
  // Convert weight to kg if necessary
  const weightInGrams = weight;
  
  // Calculate Nm (meters/gram)
  const nm = length / weightInGrams;
  
  // Convert to other systems
  return convertYarnCount(nm, YarnCountSystems.NM);
}

/**
 * Formats a number with fixed decimal places
 * @param value The number to format
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted number string
 */
function formatNumber(value, decimals = 2) {
  return parseFloat(value).toFixed(decimals);
}

// GSM Calculation Function
function calculateGsmExcelMethod(epi, ppi, warpCount, weftCount, warpSystem, weftSystem, warpShrink, weftShrink) {
  // Convert shrinkage to decimal
  const warpShrinkage = warpShrink / 100;
  const weftShrinkage = weftShrink / 100;
  
  // Apply opposite shrinkage (weft to EPI, warp to PPI) as per Excel method
  const finishEPI = epi * (1 + weftShrinkage);
  const finishPPI = ppi * (1 + warpShrinkage);
  
  // Convert to meters (1 inch = 0.0254 meters)
  const endsPerMeter = finishEPI * 39.37;
  const picksPerMeter = finishPPI * 39.37;
  
  // Convert yarn counts to Nm for calculation
  let warpNm, weftNm;
  
  switch(warpSystem) {
    case YarnCountSystems.NE:
      warpNm = neToNm(warpCount);
      break;
    case YarnCountSystems.NM:
      warpNm = warpCount;
      break;
    case YarnCountSystems.TEX:
      warpNm = 1000 / warpCount;
      break;
    case YarnCountSystems.DENIER:
      warpNm = 9000 / warpCount;
      break;
    case YarnCountSystems.LINEN:
      warpNm = warpCount * 1.65;
      break;
    default:
      warpNm = 0;
  }
  
  switch(weftSystem) {
    case YarnCountSystems.NE:
      weftNm = neToNm(weftCount);
      break;
    case YarnCountSystems.NM:
      weftNm = weftCount;
      break;
    case YarnCountSystems.TEX:
      weftNm = 1000 / weftCount;
      break;
    case YarnCountSystems.DENIER:
      weftNm = 9000 / weftCount;
      break;
    case YarnCountSystems.LINEN:
      weftNm = weftCount * 1.65;
      break;
    default:
      weftNm = 0;
  }
  
  // Calculate GSM with double shrinkage application (apply shrinkage again)
  const warpWeight = (endsPerMeter / warpNm) * (1 + warpShrinkage);
  const weftWeight = (picksPerMeter / weftNm) * (1 + weftShrinkage);
  
  const gsm = warpWeight + weftWeight;
  
  return {
    gsm: gsm,
    details: {
      finishEPI,
      finishPPI,
      endsPerMeter,
      picksPerMeter,
      warpNm,
      weftNm,
      warpWeight,
      weftWeight
    }
  };
}

// GSM Calculation Functions for different count systems
function gsm_ne(epi, ppi, warp_ne, weft_ne, warp_shrink, weft_shrink) {
  return calculateGsmExcelMethod(
    epi, ppi, warp_ne, weft_ne,
    YarnCountSystems.NE, YarnCountSystems.NE,
    warp_shrink, weft_shrink
  ).gsm;
}

/**
 * GSM formula for Nm (Metric Count)
 */
function gsm_nm(epi, ppi, warp_nm, weft_nm, warp_shrink, weft_shrink) {
  return calculateGsmExcelMethod(
    epi, ppi, warp_nm, weft_nm,
    YarnCountSystems.NM, YarnCountSystems.NM,
    warp_shrink, weft_shrink
  ).gsm;
}

/**
 * GSM formula for Tex Count
 */
function gsm_tex(epi, ppi, warp_tex, weft_tex, warp_shrink, weft_shrink) {
  return calculateGsmExcelMethod(
    epi, ppi, warp_tex, weft_tex,
    YarnCountSystems.TEX, YarnCountSystems.TEX,
    warp_shrink, weft_shrink
  ).gsm;
}

/**
 * GSM formula for Denier Count
 */
function gsm_denier(epi, ppi, warp_den, weft_den, warp_shrink, weft_shrink) {
  return calculateGsmExcelMethod(
    epi, ppi, warp_den, weft_den,
    YarnCountSystems.DENIER, YarnCountSystems.DENIER,
    warp_shrink, weft_shrink
  ).gsm;
}

/**
 * GSM formula for Linen Count (Lea)
 */
function gsm_linen(epi, ppi, warp_lin, weft_lin, warp_shrink, weft_shrink) {
  return calculateGsmExcelMethod(
    epi, ppi, warp_lin, weft_lin,
    YarnCountSystems.LINEN, YarnCountSystems.LINEN,
    warp_shrink, weft_shrink
  ).gsm;
}

/**
 * Calculates yarn weight based on count, system, and length
 */
function calculateYarnWeight(count, system, length) {
  // Convert to Tex first (weight in grams per 1000 meters)
  const texValue = convertToTex(count, system);
  
  // Calculate weight: (Tex × Length) / 1000
  const weightInGrams = (texValue * length) / 1000;
  
  return weightInGrams;
}

/**
 * Calculate cover factor
 */
function calculateCoverFactor(epi, ppi, warpCount, weftCount, warpSystem, weftSystem, weaveType) {
  // Convert counts to Ne (English count)
  function convertToNe(count, system) {
    switch(system) {
      case 'Ne':
        return count;
      case 'Nm':
        return count / 1.693;
      case 'Tex':
        return 590.5 / count;
      case 'Denier':
        return 5315 / count;
      case 'Linen':
        return count / 2.8;
      default:
        return count;
    }
  }

  const warpNe = convertToNe(warpCount, warpSystem);
  const weftNe = convertToNe(weftCount, weftSystem);
  
  // Calculate cover factors using Peirce's formula
  const warpCF = epi / Math.sqrt(warpNe);
  const weftCF = ppi / Math.sqrt(weftNe);
  
  // Adjust for weave type
  let weaveFactor = 1;
  switch (weaveType) {
    case WeaveTypes.PLAIN:
      weaveFactor = 1;
      break;
    case WeaveTypes.TWILL:
      weaveFactor = 0.9;
      break;
    case WeaveTypes.SATIN:
      weaveFactor = 0.8;
      break;
  }
  
  // Calculate total cover factor as the sum of warp and weft cover factors
  const totalCF = (warpCF + weftCF) * weaveFactor;
  
  return {
    warpCF,
    weftCF,
    totalCF
  };
}

// Local Storage Functions
function saveCalculation(calculatorType, inputs, result) {
  try {
    // Get existing calculations or initialize empty array
    let calculations = localStorage.getItem(calculatorType);
    calculations = calculations ? JSON.parse(calculations) : [];
    
    // Add new calculation to the beginning of the array
    calculations.unshift({
      timestamp: new Date().toISOString(),
      inputs,
      result
    });
    
    // Limit to 20 most recent calculations
    if (calculations.length > 20) {
      calculations = calculations.slice(0, 20);
    }
    
    // Save back to localStorage
    localStorage.setItem(calculatorType, JSON.stringify(calculations));
    
    return true;
  } catch (error) {
    console.error('Error saving calculation:', error);
    return false;
  }
}

/**
 * Gets recent calculations from local storage
 */
function getRecentCalculations(calculatorType) {
  try {
    const calculations = localStorage.getItem(calculatorType);
    return calculations ? JSON.parse(calculations) : [];
  } catch (error) {
    console.error('Error getting recent calculations:', error);
    return [];
  }
}

/**
 * Clears all saved calculations for a specific calculator type
 */
function clearCalculations(calculatorType) {
  try {
    localStorage.removeItem(calculatorType);
    return true;
  } catch (error) {
    console.error('Error clearing calculations:', error);
    return false;
  }
}

/**
 * Shows the selected calculator and hides all others
 * @param {string} calculatorId - The ID of the calculator to show
 */
function showCalculator(calculatorId) {
  // Hide all calculator sections
  document.querySelectorAll('.calculator-section').forEach(section => {
    section.classList.add('hidden');
  });
  
  // Show the selected calculator
  const selectedCalculator = document.getElementById(calculatorId);
  if (selectedCalculator) {
    selectedCalculator.classList.remove('hidden');
  }
  
  // Update active tab styling
  document.querySelectorAll('.calculator-tab').forEach(tab => {
    tab.classList.remove('bg-blue-600', 'text-white');
    tab.classList.add('bg-gray-200', 'hover:bg-blue-100');
  });
  
  // Set active tab
  const activeTab = document.querySelector(`.calculator-tab[href="#${calculatorId}"]`);
  if (activeTab) {
    activeTab.classList.remove('bg-gray-200', 'hover:bg-blue-100');
    activeTab.classList.add('bg-blue-600', 'text-white');
  }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize mobile menu toggle
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
    });
  }
  
  // Initialize calculator tabs
  document.querySelectorAll('.calculator-tab').forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href').substring(1); // Remove the # from href
      showCalculator(targetId);
      
      // Close mobile menu after clicking
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
      }
    });
  });
  
  // Initialize GSM Calculator
  initGsmCalculator();
  
  // Initialize Yarn Count Converter
  initYarnCountConverter();
  
  // Initialize Cover Factor Calculator
  initCoverFactorCalculator();
  
  // Initialize Yarn Count Finder
  initYarnCountFinder();
  
  // Initialize Yarn Weight Calculator
  initYarnWeightCalculator();
  
  // Initialize Basic Converters
  initBasicConverters();
  
  // Show the GSM calculator by default
  showCalculator('gsm');
});

// GSM Calculator
function initGsmCalculator() {
  const gsmSection = document.getElementById('gsm');
  if (!gsmSection) return;
  
  // Get form elements
  const epiInput = gsmSection.querySelector('input[placeholder="60"]');
  const ppiInput = gsmSection.querySelector('input[placeholder="55"]');
  const warpCountInput = gsmSection.querySelector('input[placeholder="30"]');
  const weftCountInput = gsmSection.querySelector('input[placeholder="30"]');
  const warpCountSystemSelect = gsmSection.querySelectorAll('select')[0];
  const weftCountSystemSelect = gsmSection.querySelectorAll('select')[1];
  const warpShrinkageInput = gsmSection.querySelector('input[placeholder="2"]');
  const weftShrinkageInput = gsmSection.querySelector('input[placeholder="1"]');
  
  // Get buttons
  const calculateButton = gsmSection.querySelector('button.bg-blue-600');
  const resetButton = gsmSection.querySelector('button.bg-gray-200');
  const saveButton = gsmSection.querySelector('button.bg-green-600');
  
  // Get result elements
  const resultValueElement = gsmSection.querySelector('.font-bold.text-blue-600');
  const resultDetailsElement = gsmSection.querySelector('.text-sm.text-gray-600 p:last-child');
  
  // Load recent calculations
  loadGsmRecentCalculations();
  
  // Add event listeners
  if (calculateButton) {
    calculateButton.addEventListener('click', function() {
      // Get input values
      const epi = parseFloat(epiInput.value);
      const ppi = parseFloat(ppiInput.value);
      const warpCount = parseFloat(warpCountInput.value);
      const weftCount = parseFloat(weftCountInput.value);
      const warpCountSystem = warpCountSystemSelect.value;
      const weftCountSystem = weftCountSystemSelect.value;
      const warpShrinkage = parseFloat(warpShrinkageInput.value);
      const weftShrinkage = parseFloat(weftShrinkageInput.value);
      
      // Validate inputs
      if (isNaN(epi) || isNaN(ppi) || isNaN(warpCount) || isNaN(weftCount) || 
          isNaN(warpShrinkage) || isNaN(weftShrinkage) ||
          epi <= 0 || ppi <= 0 || warpCount <= 0 || weftCount <= 0) {
        alert('Please enter valid positive values for all fields.');
        return;
      }
      
      // Calculate GSM
      const result = calculateGsmExcelMethod(
        epi, ppi, warpCount, weftCount, 
        warpCountSystem, weftCountSystem, 
        warpShrinkage, weftShrinkage
      );
      
      // Update result display
      resultValueElement.textContent = formatNumber(result.gsm, 2) + ' g/m²';
      
      // Update calculation details - simplified output
      resultDetailsElement.innerHTML = `
        <span class="block">GSM (Grams per Square Meter): ${formatNumber(result.gsm, 2)} g/m²</span>
        <span class="block">Fabric with EPI: ${epi}, PPI: ${ppi}, Warp count: ${warpCount}${warpCountSystem}, Weft count: ${weftCount}${weftCountSystem}</span>
        <span class="block">Shrinkages - Warp: ${warpShrinkage}%, Weft: ${weftShrinkage}%</span>
      `;
    });
  }
  
  if (resetButton) {
    resetButton.addEventListener('click', function() {
      // Reset form inputs
      epiInput.value = '';
      ppiInput.value = '';
      warpCountInput.value = '';
      weftCountInput.value = '';
      warpShrinkageInput.value = '';
      weftShrinkageInput.value = '';
      
      // Reset result display
      resultValueElement.textContent = '-- g/m²';
      resultDetailsElement.textContent = 'Enter values and click Calculate to see results.';
    });
  }
  
  if (saveButton) {
    saveButton.addEventListener('click', function() {
      // Check if calculation has been performed
      const gsmResult = resultValueElement.textContent;
      if (gsmResult === '-- g/m²') {
        alert('Please calculate GSM first before saving.');
        return;
      }
      
      // Get input values
      const inputs = {
        epi: parseFloat(epiInput.value),
        ppi: parseFloat(ppiInput.value),
        warpCount: parseFloat(warpCountInput.value),
        weftCount: parseFloat(weftCountInput.value),
        warpCountSystem: warpCountSystemSelect.value,
        weftCountSystem: weftCountSystemSelect.value,
        warpShrinkage: parseFloat(warpShrinkageInput.value),
        weftShrinkage: parseFloat(weftShrinkageInput.value)
      };
      
      // Save calculation
      const saved = saveCalculation('gsm', inputs, gsmResult);
      if (saved) {
        alert('Calculation saved successfully!');
        loadGsmRecentCalculations();
      } else {
        alert('Failed to save calculation. Please try again.');
      }
    });
  }
  
  function loadGsmRecentCalculations() {
    const recentCalculations = getRecentCalculations('gsm');
    const recentCalculationsContainer = gsmSection.querySelector('h4.font-medium.mb-2').nextElementSibling;
    
    // Clear existing calculations
    recentCalculationsContainer.innerHTML = '';
    
    // If no saved calculations, show message
    if (!recentCalculations || recentCalculations.length === 0) {
      recentCalculationsContainer.innerHTML = `
        <div class="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
          <p class="text-center text-gray-500">No saved calculations yet.</p>
        </div>
      `;
      return;
    }
    
    // Add recent calculations
    recentCalculations.slice(0, 5).forEach(calc => {
      const calcDiv = document.createElement('div');
      calcDiv.className = 'bg-gray-50 p-3 rounded border border-gray-200 text-sm mb-2';
      
      // Create display text
      const displayText = `EPI: ${calc.inputs.epi}, PPI: ${calc.inputs.ppi}, Warp: ${calc.inputs.warpCount}${calc.inputs.warpCountSystem}, Weft: ${calc.inputs.weftCount}${calc.inputs.weftCountSystem}`;
      
      calcDiv.innerHTML = `
        <div class="flex justify-between">
          <span>${displayText}</span>
          <span class="font-medium">${calc.result}</span>
        </div>
      `;
      
      // Make calculation clickable
      calcDiv.style.cursor = 'pointer';
      calcDiv.addEventListener('click', function() {
        // Load calculation values
        epiInput.value = calc.inputs.epi;
        ppiInput.value = calc.inputs.ppi;
        warpCountInput.value = calc.inputs.warpCount;
        weftCountInput.value = calc.inputs.weftCount;
        warpCountSystemSelect.value = calc.inputs.warpCountSystem;
        weftCountSystemSelect.value = calc.inputs.weftCountSystem;
        warpShrinkageInput.value = calc.inputs.warpShrinkage;
        weftShrinkageInput.value = calc.inputs.weftShrinkage;
        
        // Trigger calculation
        calculateButton.click();
      });
      
      recentCalculationsContainer.appendChild(calcDiv);
    });
    
    // Add clear button
    const clearButton = document.createElement('button');
    clearButton.className = 'px-4 py-1 mt-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs';
    clearButton.textContent = 'Clear History';
    clearButton.addEventListener('click', function() {
      if (confirm('Are you sure you want to clear all saved GSM calculations?')) {
        clearCalculations('gsm');
        loadGsmRecentCalculations();
      }
    });
    
    recentCalculationsContainer.appendChild(clearButton);
  }
}

// Count Converter (renamed from Yarn Count Converter)
function initYarnCountConverter() {
  const section = document.getElementById('countconverter');
  if (!section) return;
  
  // Get form elements
  const countValueInput = document.getElementById('count-value');
  const countSystemSelect = document.getElementById('count-system');
  const convertButton = document.getElementById('convert-count-btn');
  const resetButton = document.getElementById('reset-count-btn');
  const saveButton = document.getElementById('save-count-btn');
  
  // Get result elements
  const resultNe = document.getElementById('result-ne');
  const resultNm = document.getElementById('result-nm');
  const resultTex = document.getElementById('result-tex');
  const resultDenier = document.getElementById('result-denier');
  const resultLinen = document.getElementById('result-linen');
  
  // Set up event listeners
  if (convertButton) {
    convertButton.addEventListener('click', function() {
      const countValue = parseFloat(countValueInput.value);
      const countSystem = countSystemSelect.value;
      
      // Validate input
      if (isNaN(countValue) || countValue <= 0) {
        alert('Please enter a valid count value greater than zero.');
        return;
      }
      
      // Convert count
      const results = convertYarnCount(countValue, countSystem);
      
      // Update result display
      resultNe.textContent = formatNumber(results[YarnCountSystems.NE], 2);
      resultNm.textContent = formatNumber(results[YarnCountSystems.NM], 2);
      resultTex.textContent = formatNumber(results[YarnCountSystems.TEX], 2);
      resultDenier.textContent = formatNumber(results[YarnCountSystems.DENIER], 2);
      resultLinen.textContent = formatNumber(results[YarnCountSystems.LINEN], 2);
    });
  }
  
  if (resetButton) {
    resetButton.addEventListener('click', function() {
      // Reset form
      countValueInput.value = '';
      countSystemSelect.selectedIndex = 0;
      
      // Reset results
      resultNe.textContent = '--';
      resultNm.textContent = '--';
      resultTex.textContent = '--';
      resultDenier.textContent = '--';
      resultLinen.textContent = '--';
    });
  }
  
  if (saveButton) {
    saveButton.addEventListener('click', function() {
      const countValue = parseFloat(countValueInput.value);
      
      // Check if conversion has been performed
      if (isNaN(countValue) || countValue <= 0 || resultNe.textContent === '--') {
        alert('Please perform a conversion first before saving.');
        return;
      }
      
      // Prepare inputs and results
      const inputs = {
        countValue: countValue,
        countSystem: countSystemSelect.value
      };
      
      const results = {
        ne: resultNe.textContent,
        nm: resultNm.textContent,
        tex: resultTex.textContent,
        denier: resultDenier.textContent,
        linen: resultLinen.textContent
      };
      
      // Save calculation
      const saved = saveCalculation('yarn_count', inputs, results);
      if (saved) {
        alert('Conversion saved successfully!');
        loadRecentConversions();
      } else {
        alert('Failed to save conversion. Please try again.');
      }
    });
  }
  
  // Load recent conversions on initialization
  loadRecentConversions();
  
  function loadRecentConversions() {
    const recentConversions = getRecentCalculations('yarn_count');
    const recentList = document.getElementById('recent-conversions-list');
    
    // Clear existing conversions
    recentList.innerHTML = '';
    
    // If no saved conversions, show message
    if (!recentConversions || recentConversions.length === 0) {
      recentList.innerHTML = `
        <div class="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
          <p class="text-center text-gray-500">No saved conversions yet.</p>
        </div>
      `;
      return;
    }
    
    // Add recent conversions
    recentConversions.slice(0, 5).forEach(conversion => {
      const conversionDiv = document.createElement('div');
      conversionDiv.className = 'bg-gray-50 p-3 rounded border border-gray-200 text-sm mb-2';
      
      conversionDiv.innerHTML = `
        <div class="flex justify-between">
          <span>${conversion.inputs.countValue} ${conversion.inputs.countSystem}</span>
          <span class="font-medium">${conversion.inputs.countSystem} → All Systems</span>
        </div>
      `;
      
      // Make conversion clickable
      conversionDiv.style.cursor = 'pointer';
      conversionDiv.addEventListener('click', function() {
        // Load conversion values
        countValueInput.value = conversion.inputs.countValue;
        countSystemSelect.value = conversion.inputs.countSystem;
        
        // Trigger conversion
        convertButton.click();
      });
      
      recentList.appendChild(conversionDiv);
    });
    
    // Add clear button
    const clearButton = document.createElement('button');
    clearButton.className = 'px-4 py-1 mt-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs';
    clearButton.textContent = 'Clear History';
    clearButton.addEventListener('click', function() {
      if (confirm('Are you sure you want to clear all saved conversions?')) {
        clearCalculations('yarn_count');
        loadRecentConversions();
      }
    });
    
    recentList.appendChild(clearButton);
  }
}

// Cover Factor Calculator
function initCoverFactorCalculator() {
  const section = document.getElementById('coverfactor');
  if (!section) return;
  
  // Get form elements
  const epiInput = document.getElementById('cf-epi');
  const ppiInput = document.getElementById('cf-ppi');
  const warpCountInput = document.getElementById('cf-warp-count');
  const weftCountInput = document.getElementById('cf-weft-count');
  const warpSystemSelect = document.getElementById('cf-warp-system');
  const weftSystemSelect = document.getElementById('cf-weft-system');
  const weaveTypeSelect = document.getElementById('cf-weave-type');
  
  // Get buttons
  const calculateButton = document.getElementById('calculate-cf-btn');
  const resetButton = document.getElementById('reset-cf-btn');
  const saveButton = document.getElementById('save-cf-btn');
  
  // Get result elements
  const warpCfResult = document.getElementById('warp-cf-result');
  const weftCfResult = document.getElementById('weft-cf-result');
  const totalCfResult = document.getElementById('total-cf-result');
  
  // Add event listeners
  if (calculateButton) {
    calculateButton.addEventListener('click', function() {
      // Get input values
      const epi = parseFloat(epiInput.value);
      const ppi = parseFloat(ppiInput.value);
      const warpCount = parseFloat(warpCountInput.value);
      const weftCount = parseFloat(weftCountInput.value);
      const warpSystem = warpSystemSelect.value;
      const weftSystem = weftSystemSelect.value;
      const weaveType = weaveTypeSelect.value;
      
      // Validate inputs
      if (isNaN(epi) || isNaN(ppi) || isNaN(warpCount) || isNaN(weftCount) ||
          epi <= 0 || ppi <= 0 || warpCount <= 0 || weftCount <= 0) {
        alert('Please enter valid positive values for all fields.');
        return;
      }
      
      // Calculate cover factor
      const result = calculateCoverFactor(
        epi, ppi, warpCount, weftCount, 
        warpSystem, weftSystem, weaveType
      );
      
      // Update result display
      warpCfResult.textContent = formatNumber(result.warpCF, 2);
      weftCfResult.textContent = formatNumber(result.weftCF, 2);
      totalCfResult.textContent = formatNumber(result.totalCF, 2);
    });
  }
  
  if (resetButton) {
    resetButton.addEventListener('click', function() {
      // Reset form
      epiInput.value = '';
      ppiInput.value = '';
      warpCountInput.value = '';
      weftCountInput.value = '';
      warpSystemSelect.selectedIndex = 0;
      weftSystemSelect.selectedIndex = 0;
      weaveTypeSelect.selectedIndex = 0;
      
      // Reset results
      warpCfResult.textContent = '--';
      weftCfResult.textContent = '--';
      totalCfResult.textContent = '--';
    });
  }
  
  if (saveButton) {
    saveButton.addEventListener('click', function() {
      // Check if calculation has been performed
      if (warpCfResult.textContent === '--') {
        alert('Please calculate cover factor first before saving.');
        return;
      }
      
      // Prepare inputs and results
      const inputs = {
        epi: parseFloat(epiInput.value),
        ppi: parseFloat(ppiInput.value),
        warpCount: parseFloat(warpCountInput.value),
        weftCount: parseFloat(weftCountInput.value),
        warpSystem: warpSystemSelect.value,
        weftSystem: weftSystemSelect.value,
        weaveType: weaveTypeSelect.value
      };
      
      const results = {
        warpCF: warpCfResult.textContent,
        weftCF: weftCfResult.textContent,
        totalCF: totalCfResult.textContent
      };
      
      // Save calculation
      const saved = saveCalculation('cover_factor', inputs, results);
      if (saved) {
        alert('Calculation saved successfully!');
        loadRecentCoverFactorCalculations();
      } else {
        alert('Failed to save calculation. Please try again.');
      }
    });
  }
  
  // Load recent calculations on initialization
  loadRecentCoverFactorCalculations();
  
  function loadRecentCoverFactorCalculations() {
    const recentCalculations = getRecentCalculations('cover_factor');
    const recentList = document.getElementById('recent-cf-list');
    
    // Clear existing calculations
    recentList.innerHTML = '';
    
    // If no saved calculations, show message
    if (!recentCalculations || recentCalculations.length === 0) {
      recentList.innerHTML = `
        <div class="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
          <p class="text-center text-gray-500">No saved calculations yet.</p>
        </div>
      `;
      return;
    }
    
    // Add recent calculations
    recentCalculations.slice(0, 5).forEach(calc => {
      const calcDiv = document.createElement('div');
      calcDiv.className = 'bg-gray-50 p-3 rounded border border-gray-200 text-sm mb-2';
      
      // Create display text
      const displayText = `EPI: ${calc.inputs.epi}, PPI: ${calc.inputs.ppi}, ${calc.inputs.weaveType} Weave`;
      
      calcDiv.innerHTML = `
        <div class="flex justify-between">
          <span>${displayText}</span>
          <span class="font-medium">CF: ${calc.results.totalCF}</span>
        </div>
      `;
      
      // Make calculation clickable
      calcDiv.style.cursor = 'pointer';
      calcDiv.addEventListener('click', function() {
        // Load calculation values
        epiInput.value = calc.inputs.epi;
        ppiInput.value = calc.inputs.ppi;
        warpCountInput.value = calc.inputs.warpCount;
        weftCountInput.value = calc.inputs.weftCount;
        warpSystemSelect.value = calc.inputs.warpSystem;
        weftSystemSelect.value = calc.inputs.weftSystem;
        weaveTypeSelect.value = calc.inputs.weaveType;
        
        // Trigger calculation
        calculateButton.click();
      });
      
      recentList.appendChild(calcDiv);
    });
    
    // Add clear button
    const clearButton = document.createElement('button');
    clearButton.className = 'px-4 py-1 mt-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs';
    clearButton.textContent = 'Clear History';
    clearButton.addEventListener('click', function() {
      if (confirm('Are you sure you want to clear all saved cover factor calculations?')) {
        clearCalculations('cover_factor');
        loadRecentCoverFactorCalculations();
      }
    });
    
    recentList.appendChild(clearButton);
  }
}

// Yarn Count Finder
function initYarnCountFinder() {
  const section = document.getElementById('yarnfinder');
  if (!section) return;
  
  // Get form elements
  const lengthInput = document.getElementById('yarn-length');
  const weightInput = document.getElementById('yarn-weight');
  const weightUnitSelect = document.getElementById('weight-unit');
  
  // Get buttons
  const findButton = document.getElementById('find-count-btn');
  const resetButton = document.getElementById('reset-finder-btn');
  const saveButton = document.getElementById('save-finder-btn');
  
  // Get result elements
  const resultNe = document.getElementById('finder-ne-result');
  const resultNm = document.getElementById('finder-nm-result');
  const resultTex = document.getElementById('finder-tex-result');
  const resultDenier = document.getElementById('finder-denier-result');
  const resultLinen = document.getElementById('finder-linen-result');
  
  // Add event listeners
  if (findButton) {
    findButton.addEventListener('click', function() {
      // Get input values
      const length = parseFloat(lengthInput.value);
      let weight = parseFloat(weightInput.value);
      const weightUnit = weightUnitSelect.value;
      
      // Validate inputs
      if (isNaN(length) || isNaN(weight) || length <= 0 || weight <= 0) {
        alert('Please enter valid positive values for length and weight.');
        return;
      }
      
      // Convert weight to grams if necessary
      if (weightUnit === 'kg') {
        weight = weight * 1000; // Convert kg to grams
      }
      
      // Calculate yarn count
      const results = getYarnCountFromLengthAndWeight(length, weight);
      
      // Update result display
      resultNe.textContent = formatNumber(results[YarnCountSystems.NE], 2);
      resultNm.textContent = formatNumber(results[YarnCountSystems.NM], 2);
      resultTex.textContent = formatNumber(results[YarnCountSystems.TEX], 2);
      resultDenier.textContent = formatNumber(results[YarnCountSystems.DENIER], 2);
      resultLinen.textContent = formatNumber(results[YarnCountSystems.LINEN], 2);
    });
  }
  
  if (resetButton) {
    resetButton.addEventListener('click', function() {
      // Reset form
      lengthInput.value = '';
      weightInput.value = '';
      weightUnitSelect.selectedIndex = 0;
      
      // Reset results
      resultNe.textContent = '--';
      resultNm.textContent = '--';
      resultTex.textContent = '--';
      resultDenier.textContent = '--';
      resultLinen.textContent = '--';
    });
  }
  
  if (saveButton) {
    saveButton.addEventListener('click', function() {
      // Check if calculation has been performed
      if (resultNe.textContent === '--') {
        alert('Please calculate yarn count first before saving.');
        return;
      }
      
      // Prepare inputs and results
      const inputs = {
        length: parseFloat(lengthInput.value),
        weight: parseFloat(weightInput.value),
        weightUnit: weightUnitSelect.value
      };
      
      const results = {
        ne: resultNe.textContent,
        nm: resultNm.textContent,
        tex: resultTex.textContent,
        denier: resultDenier.textContent,
        linen: resultLinen.textContent
      };
      
      // Save calculation
      const saved = saveCalculation('yarn_finder', inputs, results);
      if (saved) {
        alert('Calculation saved successfully!');
        loadRecentYarnFinderCalculations();
      } else {
        alert('Failed to save calculation. Please try again.');
      }
    });
  }
  
  // Load recent calculations on initialization
  loadRecentYarnFinderCalculations();
  
  function loadRecentYarnFinderCalculations() {
    const recentCalculations = getRecentCalculations('yarn_finder');
    const recentList = document.getElementById('recent-finder-list');
    
    // Clear existing calculations
    recentList.innerHTML = '';
    
    // If no saved calculations, show message
    if (!recentCalculations || recentCalculations.length === 0) {
      recentList.innerHTML = `
        <div class="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
          <p class="text-center text-gray-500">No saved calculations yet.</p>
        </div>
      `;
      return;
    }
    
    // Add recent calculations
    recentCalculations.slice(0, 5).forEach(calc => {
      const calcDiv = document.createElement('div');
      calcDiv.className = 'bg-gray-50 p-3 rounded border border-gray-200 text-sm mb-2';
      
      // Create display text
      const weightUnitDisplay = calc.inputs.weightUnit === 'kg' ? 'kg' : 'g';
      const displayText = `Length: ${calc.inputs.length}m, Weight: ${calc.inputs.weight}${weightUnitDisplay}`;
      
      calcDiv.innerHTML = `
        <div class="flex justify-between">
          <span>${displayText}</span>
          <span class="font-medium">Ne: ${calc.results.ne}, Nm: ${calc.results.nm}</span>
        </div>
      `;
      
      // Make calculation clickable
      calcDiv.style.cursor = 'pointer';
      calcDiv.addEventListener('click', function() {
        // Load calculation values
        lengthInput.value = calc.inputs.length;
        weightInput.value = calc.inputs.weight;
        weightUnitSelect.value = calc.inputs.weightUnit;
        
        // Trigger calculation
        findButton.click();
      });
      
      recentList.appendChild(calcDiv);
    });
    
    // Add clear button
    const clearButton = document.createElement('button');
    clearButton.className = 'px-4 py-1 mt-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs';
    clearButton.textContent = 'Clear History';
    clearButton.addEventListener('click', function() {
      if (confirm('Are you sure you want to clear all saved yarn count finder calculations?')) {
        clearCalculations('yarn_finder');
        loadRecentYarnFinderCalculations();
      }
    });
    
    recentList.appendChild(clearButton);
  }
}

// Yarn Weight Calculator
function initYarnWeightCalculator() {
  const section = document.getElementById('yarnweight');
  if (!section) return;
  
  // Get form elements
  const countInput = document.getElementById('yarn-count');
  const countSystemSelect = document.getElementById('yarn-count-system');
  const lengthInput = document.getElementById('weight-calc-length');
  
  // Get buttons
  const calculateButton = document.getElementById('calculate-weight-btn');
  const resetButton = document.getElementById('reset-weight-btn');
  const saveButton = document.getElementById('save-weight-btn');
  
  // Get result elements
  const weightResult = document.getElementById('yarn-weight-result');
  const calculationDetails = document.getElementById('weight-calculation-details');
  
  // Add event listeners
  if (calculateButton) {
    calculateButton.addEventListener('click', function() {
      // Get input values
      const count = parseFloat(countInput.value);
      const countSystem = countSystemSelect.value;
      const length = parseFloat(lengthInput.value);
      
      // Validate inputs
      if (isNaN(count) || isNaN(length) || count <= 0 || length <= 0) {
        alert('Please enter valid positive values for count and length.');
        return;
      }
      
      // Calculate yarn weight
      const weightInGrams = calculateYarnWeight(count, countSystem, length);
      
      // Update result display
      weightResult.textContent = formatNumber(weightInGrams, 2) + ' grams';
      
      // Update calculation details
      let detailsText = `Calculation using ${countSystem} count ${count}:`;
      
      // Add tex conversion details
      const texValue = convertToTex(count, countSystem);
      detailsText += `\n1. Convert ${countSystem} ${count} to Tex: ${formatNumber(texValue, 2)} Tex`;
      
      // Add weight calculation formula
      detailsText += `\n2. Calculate weight using formula: (Tex × Length) / 1000`;
      detailsText += `\n3. Calculate: (${formatNumber(texValue, 2)} × ${length}) / 1000 = ${formatNumber(weightInGrams, 2)} grams`;
      
      calculationDetails.textContent = detailsText;
    });
  }
  
  if (resetButton) {
    resetButton.addEventListener('click', function() {
      // Reset form
      countInput.value = '';
      countSystemSelect.selectedIndex = 0;
      lengthInput.value = '';
      
      // Reset results
      weightResult.textContent = '-- grams';
      calculationDetails.textContent = 'Enter values and click Calculate to see results.';
    });
  }
  
  if (saveButton) {
    saveButton.addEventListener('click', function() {
      // Check if calculation has been performed
      if (weightResult.textContent === '-- grams') {
        alert('Please calculate yarn weight first before saving.');
        return;
      }
      
      // Prepare inputs and results
      const inputs = {
        count: parseFloat(countInput.value),
        countSystem: countSystemSelect.value,
        length: parseFloat(lengthInput.value)
      };
      
      // Save calculation
      const saved = saveCalculation('yarn_weight', inputs, weightResult.textContent);
      if (saved) {
        alert('Calculation saved successfully!');
        loadRecentWeightCalculations();
      } else {
        alert('Failed to save calculation. Please try again.');
      }
    });
  }
  
  // Load recent calculations on initialization
  loadRecentWeightCalculations();
  
  function loadRecentWeightCalculations() {
    const recentCalculations = getRecentCalculations('yarn_weight');
    const recentList = document.getElementById('recent-weight-list');
    
    // Clear existing calculations
    recentList.innerHTML = '';
    
    // If no saved calculations, show message
    if (!recentCalculations || recentCalculations.length === 0) {
      recentList.innerHTML = `
        <div class="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
          <p class="text-center text-gray-500">No saved calculations yet.</p>
        </div>
      `;
      return;
    }
    
    // Add recent calculations
    recentCalculations.slice(0, 5).forEach(calc => {
      const calcDiv = document.createElement('div');
      calcDiv.className = 'bg-gray-50 p-3 rounded border border-gray-200 text-sm mb-2';
      
      // Create display text
      const displayText = `Count: ${calc.inputs.count} ${calc.inputs.countSystem}, Length: ${calc.inputs.length}m`;
      
      calcDiv.innerHTML = `
        <div class="flex justify-between">
          <span>${displayText}</span>
          <span class="font-medium">${calc.result}</span>
        </div>
      `;
      
      // Make calculation clickable
      calcDiv.style.cursor = 'pointer';
      calcDiv.addEventListener('click', function() {
        // Load calculation values
        countInput.value = calc.inputs.count;
        countSystemSelect.value = calc.inputs.countSystem;
        lengthInput.value = calc.inputs.length;
        
        // Trigger calculation
        calculateButton.click();
      });
      
      recentList.appendChild(calcDiv);
    });
    
    // Add clear button
    const clearButton = document.createElement('button');
    clearButton.className = 'px-4 py-1 mt-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs';
    clearButton.textContent = 'Clear History';
    clearButton.addEventListener('click', function() {
      if (confirm('Are you sure you want to clear all saved yarn weight calculations?')) {
        clearCalculations('yarn_weight');
        loadRecentWeightCalculations();
      }
    });
    
    recentList.appendChild(clearButton);
  }
}

// Basic Converters
function initBasicConverters() {
  // Length converter
  const lengthValueInput = document.getElementById('length-value');
  const lengthFromSelect = document.getElementById('length-from');
  const lengthToSelect = document.getElementById('length-to');
  const convertLengthButton = document.getElementById('convert-length-btn');
  const lengthResult = document.getElementById('length-result');
  
  if (convertLengthButton) {
    convertLengthButton.addEventListener('click', function() {
      // Get input values
      const value = parseFloat(lengthValueInput.value);
      const fromUnit = lengthFromSelect.value;
      const toUnit = lengthToSelect.value;
      
      // Validate input
      if (isNaN(value)) {
        alert('Please enter a valid number.');
        return;
      }
      
      // Convert to meters first (base unit)
      let meters = 0;
      switch (fromUnit) {
        case 'mm': meters = value / 1000; break;
        case 'cm': meters = value / 100; break;
        case 'm': meters = value; break;
        case 'km': meters = value * 1000; break;
        case 'in': meters = value * 0.0254; break;
        case 'ft': meters = value * 0.3048; break;
        case 'yd': meters = value * 0.9144; break;
      }
      
      // Convert from meters to target unit
      let result = 0;
      switch (toUnit) {
        case 'mm': result = meters * 1000; break;
        case 'cm': result = meters * 100; break;
        case 'm': result = meters; break;
        case 'km': result = meters / 1000; break;
        case 'in': result = meters / 0.0254; break;
        case 'ft': result = meters / 0.3048; break;
        case 'yd': result = meters / 0.9144; break;
      }
      
      // Display result
      lengthResult.textContent = formatNumber(result, 4) + ' ' + toUnit;
    });
  }
  
  // Weight converter
  const weightValueInput = document.getElementById('weight-value');
  const weightFromSelect = document.getElementById('weight-from');
  const weightToSelect = document.getElementById('weight-to');
  const convertWeightButton = document.getElementById('convert-weight-btn');
  const weightResult = document.getElementById('weight-result');
  
  if (convertWeightButton) {
    convertWeightButton.addEventListener('click', function() {
      // Get input values
      const value = parseFloat(weightValueInput.value);
      const fromUnit = weightFromSelect.value;
      const toUnit = weightToSelect.value;
      
      // Validate input
      if (isNaN(value)) {
        alert('Please enter a valid number.');
        return;
      }
      
      // Convert to grams first (base unit)
      let grams = 0;
      switch (fromUnit) {
        case 'mg': grams = value / 1000; break;
        case 'g': grams = value; break;
        case 'kg': grams = value * 1000; break;
        case 'oz': grams = value * 28.3495; break;
        case 'lb': grams = value * 453.592; break;
      }
      
      // Convert from grams to target unit
      let result = 0;
      switch (toUnit) {
        case 'mg': result = grams * 1000; break;
        case 'g': result = grams; break;
        case 'kg': result = grams / 1000; break;
        case 'oz': result = grams / 28.3495; break;
        case 'lb': result = grams / 453.592; break;
      }
      
      // Display result
      weightResult.textContent = formatNumber(result, 4) + ' ' + toUnit;
    });
  }
  
  // Scientific Calculator
  const scientificDisplay = document.getElementById('scientific-display');
  const scientificButtons = document.querySelectorAll('.scientific-btn');
  const scientificClearBtn = document.getElementById('scientific-clear');
  const scientificEqualsBtn = document.getElementById('scientific-equals');
  
  if (scientificDisplay && scientificButtons) {
    let currentExpression = '';
    
    scientificButtons.forEach(button => {
      button.addEventListener('click', function() {
        const value = this.getAttribute('data-value');
        if (value) {
          if (value === 'sin' || value === 'cos' || value === 'tan' || value === 'log' || value === 'sqrt') {
            currentExpression += value + '(';
          } else {
            currentExpression += value;
          }
          scientificDisplay.value = currentExpression;
        }
      });
    });
    
    if (scientificClearBtn) {
      scientificClearBtn.addEventListener('click', function() {
        currentExpression = '';
        scientificDisplay.value = '';
      });
    }
    
    if (scientificEqualsBtn) {
      scientificEqualsBtn.addEventListener('click', function() {
        try {
          // Replace scientific functions with Math. equivalents
          let expression = currentExpression
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E');
          
          const result = eval(expression);
          scientificDisplay.value = formatNumber(result, 8);
          currentExpression = result.toString();
        } catch (error) {
          scientificDisplay.value = 'Error';
          currentExpression = '';
        }
      });
    }
  }
  
  // RGB/CMYK Color Converter
  const rgbRedInput = document.getElementById('rgb-red');
  const rgbGreenInput = document.getElementById('rgb-green');
  const rgbBlueInput = document.getElementById('rgb-blue');
  const cmykCyanInput = document.getElementById('cmyk-cyan');
  const cmykMagentaInput = document.getElementById('cmyk-magenta');
  const cmykYellowInput = document.getElementById('cmyk-yellow');
  const cmykKeyInput = document.getElementById('cmyk-key');
  const rgbToCmykBtn = document.getElementById('rgb-to-cmyk-btn');
  const cmykToRgbBtn = document.getElementById('cmyk-to-rgb-btn');
  const colorPreview = document.getElementById('color-preview');
  
  if (rgbToCmykBtn) {
    rgbToCmykBtn.addEventListener('click', function() {
      const r = parseInt(rgbRedInput.value) / 255;
      const g = parseInt(rgbGreenInput.value) / 255;
      const b = parseInt(rgbBlueInput.value) / 255;
      
      const k = 1 - Math.max(r, g, b);
      const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
      const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
      const y = k === 1 ? 0 : (1 - b - k) / (1 - k);
      
      cmykCyanInput.value = Math.round(c * 100);
      cmykMagentaInput.value = Math.round(m * 100);
      cmykYellowInput.value = Math.round(y * 100);
      cmykKeyInput.value = Math.round(k * 100);
      
      // Update color preview
      if (colorPreview) {
        colorPreview.style.backgroundColor = `rgb(${rgbRedInput.value}, ${rgbGreenInput.value}, ${rgbBlueInput.value})`;
      }
    });
  }
  
  if (cmykToRgbBtn) {
    cmykToRgbBtn.addEventListener('click', function() {
      const c = parseInt(cmykCyanInput.value) / 100;
      const m = parseInt(cmykMagentaInput.value) / 100;
      const y = parseInt(cmykYellowInput.value) / 100;
      const k = parseInt(cmykKeyInput.value) / 100;
      
      const r = Math.round(255 * (1 - c) * (1 - k));
      const g = Math.round(255 * (1 - m) * (1 - k));
      const b = Math.round(255 * (1 - y) * (1 - k));
      
      rgbRedInput.value = r;
      rgbGreenInput.value = g;
      rgbBlueInput.value = b;
      
      // Update color preview
      if (colorPreview) {
        colorPreview.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
      }
    });
  }
  
  // Percentage Calculator
  const percentBaseInput = document.getElementById('percent-base');
  const percentValueInput = document.getElementById('percent-value');
  const calculatePercentBtn = document.getElementById('calculate-percent-btn');
  const percentResultSpan = document.getElementById('percent-result');
  const percentOfBaseInput = document.getElementById('percent-of-base');
  const percentOfPercentInput = document.getElementById('percent-of-percent');
  const calculatePercentOfBtn = document.getElementById('calculate-percent-of-btn');
  const percentOfResultSpan = document.getElementById('percent-of-result');
  
  if (calculatePercentBtn) {
    calculatePercentBtn.addEventListener('click', function() {
      const base = parseFloat(percentBaseInput.value);
      const value = parseFloat(percentValueInput.value);
      
      if (isNaN(base) || isNaN(value)) {
        alert('Please enter valid numbers');
        return;
      }
      
      const result = (value / base) * 100;
      percentResultSpan.textContent = formatNumber(result, 2) + '%';
    });
  }
  
  if (calculatePercentOfBtn) {
    calculatePercentOfBtn.addEventListener('click', function() {
      const base = parseFloat(percentOfBaseInput.value);
      const percent = parseFloat(percentOfPercentInput.value);
      
      if (isNaN(base) || isNaN(percent)) {
        alert('Please enter valid numbers');
        return;
      }
      
      const result = (base * percent) / 100;
      percentOfResultSpan.textContent = formatNumber(result, 2);
    });
  }
  
  // Triangle Calculator
  const triangleSideAInput = document.getElementById('triangle-side-a');
  const triangleSideBInput = document.getElementById('triangle-side-b');
  const triangleSideCInput = document.getElementById('triangle-side-c');
  const calculateTriangleBtn = document.getElementById('calculate-triangle-btn');
  const triangleAreaSpan = document.getElementById('triangle-area');
  const trianglePerimeterSpan = document.getElementById('triangle-perimeter');
  const triangleAngleASpan = document.getElementById('triangle-angle-a');
  const triangleAngleBSpan = document.getElementById('triangle-angle-b');
  const triangleAngleCSpan = document.getElementById('triangle-angle-c');
  
  if (calculateTriangleBtn) {
    calculateTriangleBtn.addEventListener('click', function() {
      const a = parseFloat(triangleSideAInput.value);
      const b = parseFloat(triangleSideBInput.value);
      const c = parseFloat(triangleSideCInput.value);
      
      if (isNaN(a) || isNaN(b) || isNaN(c)) {
        alert('Please enter valid numbers for all sides');
        return;
      }
      
      // Check if triangle is valid
      if (a + b <= c || a + c <= b || b + c <= a) {
        alert('Invalid triangle: The sum of the lengths of any two sides must be greater than the length of the third side.');
        return;
      }
      
      // Calculate perimeter
      const perimeter = a + b + c;
      
      // Calculate area using Heron's formula
      const s = perimeter / 2;
      const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
      
      // Calculate angles using Law of Cosines
      const angleA = Math.acos((b * b + c * c - a * a) / (2 * b * c)) * (180 / Math.PI);
      const angleB = Math.acos((a * a + c * c - b * b) / (2 * a * c)) * (180 / Math.PI);
      const angleC = Math.acos((a * a + b * b - c * c) / (2 * a * b)) * (180 / Math.PI);
      
      triangleAreaSpan.textContent = formatNumber(area, 2);
      trianglePerimeterSpan.textContent = formatNumber(perimeter, 2);
      triangleAngleASpan.textContent = formatNumber(angleA, 2) + '°';
      triangleAngleBSpan.textContent = formatNumber(angleB, 2) + '°';
      triangleAngleCSpan.textContent = formatNumber(angleC, 2) + '°';
    });
  }
}