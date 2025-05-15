// DOM Elements
const loginOverlay = document.getElementById('loginOverlay');
const loginForm = document.getElementById('loginForm');
const mainContainer = document.getElementById('mainContainer');
const content = document.getElementById('content');
const pages = document.querySelectorAll('.page');

// Trainer sections
const trainerSections = {
    clients: document.getElementById('trainerClients'),
    exercises: document.getElementById('trainerExercises'),
    gym: document.getElementById('trainerGym')
};

// Client sections
const clientSections = {
    training: document.getElementById('clientTraining'),
    nutrition: document.getElementById('clientNutrition'),
    measurements: document.getElementById('clientMeasurements'),
    stats: document.getElementById('clientStats'),
    gym: document.getElementById('clientGym')
};

// Exercise data
const exercisesByMuscleGroup = {
    grudi: ['Bench press', 'Kosi bench press', 'Sklekovi', 'Pec dec mašina'],
    ledja: ['Veslanje u prednjemu', 'Mrtvo dizanje', 'Pull-up', 'Lat pulldown'],
    noge: ['Čučnjevi', 'Istezanje nogu', 'Fleksija nogu', 'Hodanje na stepenicama'],
    rame: ['Military press', 'Bocno podizanje', 'Prednje podizanje', 'Face pull'],
    biceps: ['Biceps curls', 'Činjenje sa šipkom', 'Koncentrirani biceps', 'Hammer curls'],
    triceps: ['Triceps ekstenzija', 'Triceps dips', 'Triceps pushdown', 'French press'],
    trbuh: ['Trbušnjaci', 'Dizanje nogu', 'Plank', 'Ruski twist']
};

// Current user
let currentUser = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Set active page (home by default)
    setActivePage('home');
    
    // Initialize charts if Chart.js is loaded
    if (typeof Chart !== 'undefined') {
        initializeCharts();
    }
    
    // Event listeners
    loginForm.addEventListener('submit', handleLogin);
    
    // Exercise form dynamic dropdowns
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('muscle-group')) {
            const exerciseNameSelect = e.target.closest('.exercise-item').querySelector('.exercise-name');
            updateExerciseDropdown(exerciseNameSelect, e.target.value);
        }
    });
});

// Set active page
function setActivePage(pageId) {
    pages.forEach(page => {
        page.classList.remove('active');
        if (page.id === pageId) {
            page.classList.add('active');
        }
    });
}

// Open login overlay
function openLogin() {
    loginOverlay.style.display = 'flex';
}

// Close login overlay
function closeLogin() {
    loginOverlay.style.display = 'none';
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Demo login credentials
    if (username === 'petar' && password === 'petar') {
        // Trainer login
        currentUser = { type: 'trainer', name: 'Petar' };
        setActivePage('trainerDashboard');
        showTrainerSection('clients');
    } else if (username === 'klijent' && password === 'klijent') {
        // Client login
        currentUser = { type: 'client', name: 'Klijent' };
        setActivePage('clientDashboard');
        showClientSection('training');
    } else {
        alert('Pogrešno korisničko ime ili lozinka! Pokušajte ponovo.');
        return;
    }
    
    closeLogin();
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Show trainer section
function showTrainerSection(section) {
    Object.values(trainerSections).forEach(sec => {
        sec.style.display = 'none';
    });
    
    if (trainerSections[section]) {
        trainerSections[section].style.display = 'block';
    }
    
    // Update active nav button
    const navButtons = document.querySelectorAll('.dashboard-nav .nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(section)) {
            btn.classList.add('active');
        }
    });
}

// Show client section
function showClientSection(section) {
    Object.values(clientSections).forEach(sec => {
        sec.style.display = 'none';
    });
    
    if (clientSections[section]) {
        clientSections[section].style.display = 'block';
    }
    
    // Update active nav button
    const navButtons = document.querySelectorAll('#clientDashboard .dashboard-nav .nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(section)) {
            btn.classList.add('active');
        }
    });
}

// Filter clients
function filterClients() {
    const filterValue = document.getElementById('clientFilter').value;
    const clientCards = document.querySelectorAll('.client-card');
    
    clientCards.forEach(card => {
        const status = card.querySelector('.client-status').className;
        
        switch (filterValue) {
            case 'all':
                card.style.display = 'flex';
                break;
            case 'with_training':
                if (status.includes('active')) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
                break;
            case 'waiting_training':
                if (status.includes('waiting-training')) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
                break;
            case 'waiting_payment':
                if (status.includes('waiting-payment')) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
                break;
        }
    });
}

// Filter gym members
function filterGymMembers() {
    const filterValue = document.getElementById('gymFilter').value;
    const rows = document.querySelectorAll('.gym-members-table tbody tr');
    
    rows.forEach(row => {
        const status = row.querySelector('.status-badge').className;
        
        switch (filterValue) {
            case 'all':
                row.style.display = '';
                break;
            case 'active':
                if (status.includes('active')) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
                break;
            case 'expired':
                if (status.includes('expired')) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
                break;
            case 'expiring_today':
                // This is just a demo - in a real app we'd check dates
                if (row.cells[1].textContent.includes('05.06.2023')) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
                break;
        }
    });
}

// Show client details
function showClientDetails(clientId) {
    const detailsSection = document.getElementById('clientDetails');
    detailsSection.style.display = 'block';
    
    // Scroll to details
    detailsSection.scrollIntoView({ behavior: 'smooth' });
}

// Hide client details
function hideClientDetails() {
    document.getElementById('clientDetails').style.display = 'none';
}

// Confirm payment
function confirmPayment() {
    alert('Uplata je potvrđena!');
    // In a real app, this would update the database
    const statusElement = document.querySelector('#clientDetails .client-status');
    statusElement.textContent = 'Aktivan';
    statusElement.className = 'client-status active';
    
    // Update the card in the list
    const activeCard = document.querySelector('.client-card');
    if (activeCard) {
        activeCard.querySelector('.client-status').textContent = 'Aktivan';
        activeCard.querySelector('.client-status').className = 'client-status active';
    }
}

// Show add training form
function showAddTrainingForm() {
    const form = document.getElementById('addTrainingForm');
    form.style.display = 'block';
    document.getElementById('nutritionForm').style.display = 'none';
}

// Show nutrition form
function showNutritionForm() {
    const form = document.getElementById('nutritionForm');
    form.style.display = 'block';
    document.getElementById('addTrainingForm').style.display = 'none';
}

// Show add exercise form
function showAddExerciseForm() {
    document.getElementById('addExerciseForm').style.display = 'block';
}

// Add new exercise to training
function addExercise() {
    const container = document.getElementById('exercisesContainer');
    const newExercise = document.createElement('div');
    newExercise.className = 'exercise-item';
    newExercise.innerHTML = `
        <div class="form-group">
            <label for="muscleGroup">Grupa mišića:</label>
            <select class="muscle-group" required>
                <option value="">Izaberi grupu</option>
                <option value="grudi">Grudi</option>
                <option value="ledja">Leđa</option>
                <option value="noge">Noge</option>
                <option value="rame">Rame</option>
                <option value="biceps">Biceps</option>
                <option value="triceps">Triceps</option>
                <option value="trbuh">Trbuh</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="exerciseName">Vežba:</label>
            <select class="exercise-name" required>
                <option value="">Izaberi vežbu</option>
            </select>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label for="sets">Serije:</label>
                <input type="number" class="sets" min="1" max="10" value="3" required>
            </div>
            <div class="form-group">
                <label for="reps">Ponavljanja:</label>
                <input type="number" class="reps" min="1" max="50" value="12" required>
            </div>
        </div>
        <button type="button" class="btn-small btn-danger" onclick="removeExercise(this)">Ukloni vežbu</button>
    `;
    
    container.appendChild(newExercise);
}

// Remove exercise from training
function removeExercise(button) {
    button.closest('.exercise-item').remove();
}

// Update exercise dropdown based on muscle group selection
function updateExerciseDropdown(dropdown, muscleGroup) {
    dropdown.innerHTML = '<option value="">Izaberi vežbu</option>';
    
    if (muscleGroup && exercisesByMuscleGroup[muscleGroup]) {
        exercisesByMuscleGroup[muscleGroup].forEach(exercise => {
            const option = document.createElement('option');
            option.value = exercise.toLowerCase().replace(' ', '-');
            option.textContent = exercise;
            dropdown.appendChild(option);
        });
    }
}

// Select training day
function selectTrainingDay(day) {
    const buttons = document.querySelectorAll('#clientTraining .day-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(day)) {
            btn.classList.add('active');
        }
    });
    
    // In a real app, this would load the exercises for the selected day
    document.querySelector('.training-day h4').textContent = `Dan ${day} - ${getDayTitle(day)}`;
}

// Select nutrition day
function selectNutritionDay(day) {
    const buttons = document.querySelectorAll('#clientNutrition .day-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(day)) {
            btn.classList.add('active');
        }
    });
    
    // In a real app, this would load the nutrition plan for the selected day
    document.querySelector('.nutrition-plan h4').textContent = `Preporučeni unos za Dan ${day}`;
}

// Get day title (demo purposes)
function getDayTitle(day) {
    const titles = {
        1: 'Grudi i triceps',
        2: 'Leđa i biceps',
        3: 'Noge i trbuh',
        4: 'Rame i kardio',
        5: 'Celotelo trening'
    };
    return titles[day] || '';
}

// Show exercise info modal
function showExerciseInfo(exerciseId) {
    const modal = document.getElementById('exerciseInfoModal');
    const title = document.getElementById('modalExerciseTitle');
    const description = document.getElementById('modalExerciseDescription');
    
    // In a real app, this would come from a database
    const exercises = {
        'bench-press': {
            title: 'Bench press',
            description: 'Klasična vežba za razvijanje prsnih mišića. Leći na klupu sa stopalima čvrsto na podu. Držati šipku sa širinom ramena. Spustiti šipku do donjeg dela grudi, zadržati na sekundu, zatim podići nazad u početni položaj.'
        },
        'incline-bench': {
            title: 'Kosi bench press',
            description: 'Varijacija bench pressa koja više opterećuje gornji deo prsnih mišića. Podešavanjem kosine klupe na 30-45 stepeni, izvoditi isti pokret kao kod običnog bench pressa.'
        },
        'pushups': {
            title: 'Sklekovi',
            description: 'Osnovna vežba za prsne mišiće koja se izvodi sopstvenom težinom. Držati telo u ravnoj liniji, spuštati se sve dok grudi ne dođu blizu poda, zatim se podići nazad u početni položaj.'
        },
        'triceps-extension': {
            title: 'Triceps ekstenzija',
            description: 'Vežba za izolaciju tricepsa. Leći na klupu sa utezom iznad glave, spustiti utez iza glave savijajući laktove, zatim vratiti u početni položaj ispravljajući ruke.'
        }
    };
    
    if (exercises[exerciseId]) {
        title.textContent = exercises[exerciseId].title;
        description.textContent = exercises[exerciseId].description;
        modal.style.display = 'flex';
    }
}

// Close exercise info modal
function closeExerciseInfo() {
    document.getElementById('exerciseInfoModal').style.display = 'none';
}

// Show add measurement form
function showAddMeasurementForm() {
    document.getElementById('addMeasurementForm').style.display = 'block';
}

// Initialize charts
function initializeCharts() {
    // Weight chart
    const weightCtx = document.getElementById('weightChart').getContext('2d');
    new Chart(weightCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj'],
            datasets: [{
                label: 'Težina (kg)',
                data: [84, 83.5, 83, 82.5, 82.5],
                borderColor: '#36e199',
                backgroundColor: 'rgba(54, 225, 153, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 80,
                    max: 85
                }
            }
        }
    });
    
    // Waist chart
    const waistCtx = document.getElementById('waistChart').getContext('2d');
    new Chart(waistCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj'],
            datasets: [{
                label: 'Struk (cm)',
                data: [88, 87.5, 87, 86.5, 86],
                borderColor: '#36e199',
                backgroundColor: 'rgba(54, 225, 153, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 85,
                    max: 90
                }
            }
        }
    });
    
    // Nutrition chart
    const nutritionCtx = document.getElementById('nutritionChart').getContext('2d');
    new Chart(nutritionCtx, {
        type: 'doughnut',
        data: {
            labels: ['Proteini', 'Ugljeni hidrati', 'Masti'],
            datasets: [{
                data: [180, 250, 70],
                backgroundColor: [
                    '#36e199',
                    '#3498db',
                    '#f39c12'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Gym visits chart
    const gymCtx = document.getElementById('gymVisitsChart').getContext('2d');
    new Chart(gymCtx, {
        type: 'bar',
        data: {
            labels: ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'],
            datasets: [{
                label: 'Posete',
                data: [3, 2, 5, 3, 4, 2, 1],
                backgroundColor: 'rgba(54, 225, 153, 0.7)',
                borderColor: '#36e199',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Measurements chart
    const measurementsCtx = document.getElementById('measurementsChart').getContext('2d');
    new Chart(measurementsCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj'],
            datasets: [
                {
                    label: 'Grudi (cm)',
                    data: [100, 100.5, 101, 101.5, 102],
                    borderColor: '#36e199',
                    backgroundColor: 'transparent',
                    tension: 0.3
                },
                {
                    label: 'Struk (cm)',
                    data: [88, 87.5, 87, 86.5, 86],
                    borderColor: '#3498db',
                    backgroundColor: 'transparent',
                    tension: 0.3
                },
                {
                    label: 'Biceps (cm)',
                    data: [35, 35.2, 35.5, 35.8, 36],
                    borderColor: '#f39c12',
                    backgroundColor: 'transparent',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}