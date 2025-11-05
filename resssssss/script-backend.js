import { handleLogin as authLogin, handleLogout, getCurrentUser, onAuthStateChange } from './auth.js';
import * as api from './api.js';

let currentUser = null;
let exercisesCache = [];

const loginOverlay = document.getElementById('loginOverlay');
const loginForm = document.getElementById('loginForm');
const pages = document.querySelectorAll('.page');

const trainerSections = {
    clients: document.getElementById('trainerClients'),
    exercises: document.getElementById('trainerExercises'),
    gym: document.getElementById('trainerGym')
};

const clientSections = {
    training: document.getElementById('clientTraining'),
    nutrition: document.getElementById('clientNutrition'),
    measurements: document.getElementById('clientMeasurements'),
    stats: document.getElementById('clientStats'),
    gym: document.getElementById('clientGym')
};

document.addEventListener('DOMContentLoaded', async function() {
    setActivePage('home');

    if (typeof Chart !== 'undefined') {
        initializeCharts();
    }

    loginForm.addEventListener('submit', handleLoginSubmit);

    onAuthStateChange((event, user) => {
        if (user) {
            currentUser = user;
            if (user.type === 'trainer') {
                setActivePage('trainerDashboard');
                showTrainerSection('clients');
                loadTrainerData();
            } else {
                setActivePage('clientDashboard');
                showClientSection('training');
                loadClientData();
            }
        } else {
            currentUser = null;
            setActivePage('home');
        }
    });

    const user = await getCurrentUser();
    if (user) {
        currentUser = user;
        if (user.type === 'trainer') {
            setActivePage('trainerDashboard');
            showTrainerSection('clients');
            await loadTrainerData();
        } else {
            setActivePage('clientDashboard');
            showClientSection('training');
            await loadClientData();
        }
    }

    exercisesCache = await api.getExercises();
});

function setActivePage(pageId) {
    pages.forEach(page => {
        page.classList.remove('active');
        if (page.id === pageId) {
            page.classList.add('active');
        }
    });
}

function openLogin() {
    loginOverlay.style.display = 'flex';
}

function closeLogin() {
    loginOverlay.style.display = 'none';
}

async function handleLoginSubmit(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const result = await authLogin(username, password);

    if (result.success) {
        currentUser = result.user;
        closeLogin();
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';

        if (currentUser.type === 'trainer') {
            setActivePage('trainerDashboard');
            showTrainerSection('clients');
            await loadTrainerData();
        } else {
            setActivePage('clientDashboard');
            showClientSection('training');
            await loadClientData();
        }
    } else {
        alert('Greška pri prijavi: ' + (result.error || 'Pogrešno korisničko ime ili lozinka'));
    }
}

async function handleLogoutClick() {
    await handleLogout();
    currentUser = null;
    setActivePage('home');
}

function showTrainerSection(section) {
    Object.values(trainerSections).forEach(sec => {
        if (sec) sec.style.display = 'none';
    });

    if (trainerSections[section]) {
        trainerSections[section].style.display = 'block';
    }

    const navButtons = document.querySelectorAll('.dashboard-nav .nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(section)) {
            btn.classList.add('active');
        }
    });
}

function showClientSection(section) {
    Object.values(clientSections).forEach(sec => {
        if (sec) sec.style.display = 'none';
    });

    if (clientSections[section]) {
        clientSections[section].style.display = 'block';
    }

    const navButtons = document.querySelectorAll('#clientDashboard .dashboard-nav .nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(section)) {
            btn.classList.add('active');
        }
    });
}

async function loadTrainerData() {
    if (!currentUser || currentUser.type !== 'trainer') return;

    const clients = await api.getTrainerClients(currentUser.id);
    displayTrainerClients(clients);

    const exercises = await api.getExercises();
    displayExercises(exercises);

    const gymMembers = await api.getAllGymMembers();
    displayGymMembers(gymMembers);
}

function displayTrainerClients(clients) {
    const container = document.querySelector('.clients-grid');
    if (!container) return;

    container.innerHTML = '';

    clients.forEach(relationship => {
        const client = relationship.client;
        const card = document.createElement('div');
        card.className = 'client-card';

        const initials = client.full_name.split(' ').map(n => n[0]).join('');
        const statusClass = relationship.status.replace('_', '-');
        const statusText = {
            'active': 'Aktivan',
            'waiting_payment': 'Čeka uplatu',
            'waiting_training': 'Čeka trening',
            'inactive': 'Neaktivan'
        }[relationship.status] || relationship.status;

        card.innerHTML = `
            <div class="client-avatar">${initials}</div>
            <div class="client-info">
                <h4>${client.full_name}</h4>
                <p class="client-status ${statusClass}">${statusText}</p>
                <p class="client-membership">${client.email}</p>
            </div>
        `;

        card.addEventListener('click', () => showClientDetails(relationship));
        container.appendChild(card);
    });
}

function displayExercises(exercises) {
    const container = document.querySelector('.exercises-grid');
    if (!container) return;

    container.innerHTML = '';

    exercises.forEach(exercise => {
        const card = document.createElement('div');
        card.className = 'exercise-card';

        card.innerHTML = `
            <div class="exercise-header">
                <h4>${exercise.name}</h4>
                <span class="muscle-group-tag">${exercise.muscle_group}</span>
            </div>
            <div class="exercise-description">
                <p>${exercise.description || 'Nema opisa'}</p>
                <div class="exercise-actions">
                    <button class="btn-small btn-info" onclick="showExerciseInfo('${exercise.id}')">Detalji</button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

function displayGymMembers(memberships) {
    const tbody = document.querySelector('.gym-members-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    memberships.forEach(membership => {
        const row = document.createElement('tr');

        const endDate = new Date(membership.end_date);
        const today = new Date();
        const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

        let status = 'active';
        let statusText = 'Aktivna';
        if (daysLeft < 0) {
            status = 'expired';
            statusText = 'Istekla';
        } else if (daysLeft <= 7) {
            status = 'expiring';
            statusText = 'Ističe uskoro';
        }

        row.innerHTML = `
            <td>${membership.client.full_name}</td>
            <td>${new Date(membership.end_date).toLocaleDateString('sr-RS')}</td>
            <td><span class="status-badge ${status}">${statusText}</span></td>
            <td>${membership.membership_type}</td>
            <td>
                <button class="btn-small btn-renew" onclick="renewMembership('${membership.id}')">Obnovi</button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

async function loadClientData() {
    if (!currentUser || currentUser.type !== 'client') return;

    const trainingPlan = await api.getClientTrainingPlan(currentUser.id);
    if (trainingPlan) {
        displayTrainingPlan(trainingPlan);
    }

    const nutritionPlans = await api.getClientNutritionPlan(currentUser.id);
    displayNutritionPlans(nutritionPlans);

    const measurements = await api.getClientMeasurements(currentUser.id);
    displayMeasurements(measurements);

    const gymVisits = await api.getGymVisits(currentUser.id);
    displayGymVisits(gymVisits);
}

function displayTrainingPlan(plan) {
    const container = document.querySelector('.training-day');
    if (!container || !plan.training_days || plan.training_days.length === 0) return;

    const firstDay = plan.training_days[0];

    container.innerHTML = `
        <h4>${firstDay.name}</h4>
        <div class="exercise-list" id="exerciseList"></div>
    `;

    const exerciseList = document.getElementById('exerciseList');

    firstDay.training_exercises.forEach(te => {
        const exercise = te.exercise;
        const item = document.createElement('div');
        item.className = 'exercise-item';

        item.innerHTML = `
            <div class="exercise-header">
                <h5>${exercise.name}</h5>
                <span class="muscle-group-tag">${exercise.muscle_group}</span>
            </div>
            <div class="exercise-details">
                <p>${te.sets} x ${te.reps}</p>
                <button class="btn-small btn-info" onclick="showExerciseInfo('${exercise.id}')">Info</button>
            </div>
        `;

        exerciseList.appendChild(item);
    });
}

function displayNutritionPlans(plans) {
    if (plans.length === 0) return;

    const plan = plans[0];

    const caloriesEl = document.querySelector('.nutrition-plan .stat-item:nth-child(1) .stat-value');
    const proteinEl = document.querySelector('.nutrition-plan .stat-item:nth-child(2) .stat-value');
    const carbsEl = document.querySelector('.nutrition-plan .stat-item:nth-child(3) .stat-value');
    const fatsEl = document.querySelector('.nutrition-plan .stat-item:nth-child(4) .stat-value');

    if (caloriesEl) caloriesEl.textContent = plan.calories;
    if (proteinEl) proteinEl.innerHTML = `${plan.protein}<span>g</span>`;
    if (carbsEl) carbsEl.innerHTML = `${plan.carbs}<span>g</span>`;
    if (fatsEl) fatsEl.innerHTML = `${plan.fats}<span>g</span>`;
}

function displayMeasurements(measurements) {
    const tbody = document.querySelector('.measurement-table tbody');
    if (!tbody || measurements.length === 0) return;

    tbody.innerHTML = '';

    measurements.slice(0, 5).forEach(m => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${new Date(m.measurement_date).toLocaleDateString('sr-RS')}</td>
            <td>${m.weight || '-'}</td>
            <td>${m.waist || '-'}</td>
            <td>${m.chest || '-'}</td>
            <td>${m.biceps || '-'}</td>
            <td>${m.thighs || '-'}</td>
        `;

        tbody.appendChild(row);
    });
}

function displayGymVisits(visits) {
    const tbody = document.querySelector('.visit-history tbody');
    if (!tbody || visits.length === 0) return;

    tbody.innerHTML = '';

    visits.forEach(visit => {
        const row = document.createElement('tr');

        const checkIn = new Date(visit.check_in_time);
        const duration = visit.check_out_time
            ? Math.round((new Date(visit.check_out_time) - checkIn) / (1000 * 60)) + ' min'
            : 'U teretani';

        row.innerHTML = `
            <td>${checkIn.toLocaleDateString('sr-RS')}</td>
            <td>${checkIn.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}</td>
            <td>${duration}</td>
        `;

        tbody.appendChild(row);
    });
}

function showClientDetails(relationship) {
    const detailsSection = document.getElementById('clientDetails');
    if (!detailsSection) return;

    detailsSection.style.display = 'block';
    detailsSection.scrollIntoView({ behavior: 'smooth' });
}

function hideClientDetails() {
    const detailsSection = document.getElementById('clientDetails');
    if (detailsSection) {
        detailsSection.style.display = 'none';
    }
}

async function confirmPayment() {
    alert('Funkcionalnost potvrde uplate će biti implementirana.');
}

function showAddTrainingForm() {
    const form = document.getElementById('addTrainingForm');
    const nutritionForm = document.getElementById('nutritionForm');

    if (form) form.style.display = 'block';
    if (nutritionForm) nutritionForm.style.display = 'none';
}

function showNutritionForm() {
    const form = document.getElementById('nutritionForm');
    const trainingForm = document.getElementById('addTrainingForm');

    if (form) form.style.display = 'block';
    if (trainingForm) trainingForm.style.display = 'none';
}

function showAddExerciseForm() {
    const form = document.getElementById('addExerciseForm');
    if (form) form.style.display = 'block';
}

function addExercise() {
    const container = document.getElementById('exercisesContainer');
    if (!container) return;

    const newExercise = document.createElement('div');
    newExercise.className = 'exercise-item';
    newExercise.innerHTML = `
        <div class="form-group">
            <label>Grupa mišića:</label>
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
            <label>Vežba:</label>
            <select class="exercise-name" required>
                <option value="">Izaberi vežbu</option>
            </select>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Serije:</label>
                <input type="number" class="sets" min="1" max="10" value="3" required>
            </div>
            <div class="form-group">
                <label>Ponavljanja:</label>
                <input type="number" class="reps" min="1" max="50" value="12" required>
            </div>
        </div>
        <button type="button" class="btn-small btn-danger" onclick="removeExercise(this)">Ukloni vežbu</button>
    `;

    container.appendChild(newExercise);

    const muscleGroupSelect = newExercise.querySelector('.muscle-group');
    muscleGroupSelect.addEventListener('change', function() {
        const exerciseNameSelect = newExercise.querySelector('.exercise-name');
        updateExerciseDropdown(exerciseNameSelect, this.value);
    });
}

function removeExercise(button) {
    button.closest('.exercise-item').remove();
}

async function updateExerciseDropdown(dropdown, muscleGroup) {
    dropdown.innerHTML = '<option value="">Izaberi vežbu</option>';

    if (muscleGroup) {
        const exercises = exercisesCache.filter(e => e.muscle_group === muscleGroup);

        exercises.forEach(exercise => {
            const option = document.createElement('option');
            option.value = exercise.id;
            option.textContent = exercise.name;
            dropdown.appendChild(option);
        });
    }
}

function selectTrainingDay(day) {
    const buttons = document.querySelectorAll('#clientTraining .day-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(day)) {
            btn.classList.add('active');
        }
    });
}

function selectNutritionDay(day) {
    const buttons = document.querySelectorAll('#clientNutrition .day-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(day)) {
            btn.classList.add('active');
        }
    });
}

function showExerciseInfo(exerciseId) {
    const modal = document.getElementById('exerciseInfoModal');
    if (!modal) return;

    const exercise = exercisesCache.find(e => e.id === exerciseId);
    if (!exercise) return;

    const title = document.getElementById('modalExerciseTitle');
    const description = document.getElementById('modalExerciseDescription');

    if (title) title.textContent = exercise.name;
    if (description) description.textContent = exercise.description || 'Nema opisa';

    modal.style.display = 'flex';
}

function closeExerciseInfo() {
    const modal = document.getElementById('exerciseInfoModal');
    if (modal) modal.style.display = 'none';
}

function showAddMeasurementForm() {
    const form = document.getElementById('addMeasurementForm');
    if (form) form.style.display = 'block';
}

function filterClients() {
    const filterValue = document.getElementById('clientFilter')?.value;
    if (!filterValue) return;

    const clientCards = document.querySelectorAll('.client-card');

    clientCards.forEach(card => {
        const status = card.querySelector('.client-status').className;

        switch (filterValue) {
            case 'all':
                card.style.display = 'flex';
                break;
            case 'with_training':
                card.style.display = status.includes('active') ? 'flex' : 'none';
                break;
            case 'waiting_training':
                card.style.display = status.includes('waiting-training') ? 'flex' : 'none';
                break;
            case 'waiting_payment':
                card.style.display = status.includes('waiting-payment') ? 'flex' : 'none';
                break;
        }
    });
}

function filterGymMembers() {
    const filterValue = document.getElementById('gymFilter')?.value;
    if (!filterValue) return;

    const rows = document.querySelectorAll('.gym-members-table tbody tr');

    rows.forEach(row => {
        const status = row.querySelector('.status-badge').className;

        switch (filterValue) {
            case 'all':
                row.style.display = '';
                break;
            case 'active':
                row.style.display = status.includes('active') ? '' : 'none';
                break;
            case 'expired':
                row.style.display = status.includes('expired') ? '' : 'none';
                break;
            case 'expiring_today':
                row.style.display = status.includes('expiring') ? '' : 'none';
                break;
        }
    });
}

function initializeCharts() {
    const weightCtx = document.getElementById('weightChart')?.getContext('2d');
    if (weightCtx) {
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
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: false, min: 80, max: 85 } }
            }
        });
    }
}

window.openLogin = openLogin;
window.closeLogin = closeLogin;
window.handleLogoutClick = handleLogoutClick;
window.showTrainerSection = showTrainerSection;
window.showClientSection = showClientSection;
window.showClientDetails = showClientDetails;
window.hideClientDetails = hideClientDetails;
window.confirmPayment = confirmPayment;
window.showAddTrainingForm = showAddTrainingForm;
window.showNutritionForm = showNutritionForm;
window.showAddExerciseForm = showAddExerciseForm;
window.addExercise = addExercise;
window.removeExercise = removeExercise;
window.selectTrainingDay = selectTrainingDay;
window.selectNutritionDay = selectNutritionDay;
window.showExerciseInfo = showExerciseInfo;
window.closeExerciseInfo = closeExerciseInfo;
window.showAddMeasurementForm = showAddMeasurementForm;
window.filterClients = filterClients;
window.filterGymMembers = filterGymMembers;
