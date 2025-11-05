import { supabase } from './supabaseClient.js';

export async function getTrainerClients(trainerId) {
    const { data, error } = await supabase
        .from('trainer_clients')
        .select(`
            *,
            client:profiles!trainer_clients_client_id_fkey(*)
        `)
        .eq('trainer_id', trainerId);

    if (error) {
        console.error('Error fetching clients:', error);
        return [];
    }
    return data;
}

export async function getExercises() {
    const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('is_public', true)
        .order('muscle_group', { ascending: true });

    if (error) {
        console.error('Error fetching exercises:', error);
        return [];
    }
    return data;
}

export async function getExercisesByMuscleGroup(muscleGroup) {
    const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('muscle_group', muscleGroup)
        .eq('is_public', true);

    if (error) {
        console.error('Error fetching exercises:', error);
        return [];
    }
    return data;
}

export async function createExercise(exerciseData) {
    const { data, error } = await supabase
        .from('exercises')
        .insert([exerciseData])
        .select()
        .single();

    if (error) {
        console.error('Error creating exercise:', error);
        return null;
    }
    return data;
}

export async function getClientTrainingPlan(clientId) {
    const { data, error } = await supabase
        .from('training_plans')
        .select(`
            *,
            training_days(
                *,
                training_exercises(
                    *,
                    exercise:exercises(*)
                )
            )
        `)
        .eq('client_id', clientId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('Error fetching training plan:', error);
        return null;
    }
    return data;
}

export async function createTrainingPlan(planData) {
    const { data, error } = await supabase
        .from('training_plans')
        .insert([planData])
        .select()
        .single();

    if (error) {
        console.error('Error creating training plan:', error);
        return null;
    }
    return data;
}

export async function createTrainingDay(dayData) {
    const { data, error } = await supabase
        .from('training_days')
        .insert([dayData])
        .select()
        .single();

    if (error) {
        console.error('Error creating training day:', error);
        return null;
    }
    return data;
}

export async function addExerciseToDay(exerciseData) {
    const { data, error } = await supabase
        .from('training_exercises')
        .insert([exerciseData])
        .select()
        .single();

    if (error) {
        console.error('Error adding exercise:', error);
        return null;
    }
    return data;
}

export async function getClientNutritionPlan(clientId) {
    const { data, error } = await supabase
        .from('nutrition_plans')
        .select('*')
        .eq('client_id', clientId)
        .eq('is_active', true)
        .order('day_number', { ascending: true });

    if (error) {
        console.error('Error fetching nutrition plan:', error);
        return [];
    }
    return data;
}

export async function createNutritionPlan(planData) {
    const { data, error } = await supabase
        .from('nutrition_plans')
        .insert([planData])
        .select()
        .single();

    if (error) {
        console.error('Error creating nutrition plan:', error);
        return null;
    }
    return data;
}

export async function getClientMeasurements(clientId) {
    const { data, error } = await supabase
        .from('measurements')
        .select('*')
        .eq('client_id', clientId)
        .order('measurement_date', { ascending: false });

    if (error) {
        console.error('Error fetching measurements:', error);
        return [];
    }
    return data;
}

export async function addMeasurement(measurementData) {
    const { data, error } = await supabase
        .from('measurements')
        .insert([measurementData])
        .select()
        .single();

    if (error) {
        console.error('Error adding measurement:', error);
        return null;
    }
    return data;
}

export async function getGymMemberships(clientId) {
    const { data, error } = await supabase
        .from('gym_memberships')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching memberships:', error);
        return [];
    }
    return data;
}

export async function createGymMembership(membershipData) {
    const { data, error } = await supabase
        .from('gym_memberships')
        .insert([membershipData])
        .select()
        .single();

    if (error) {
        console.error('Error creating membership:', error);
        return null;
    }
    return data;
}

export async function getGymVisits(clientId) {
    const { data, error } = await supabase
        .from('gym_visits')
        .select('*')
        .eq('client_id', clientId)
        .order('check_in_time', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching gym visits:', error);
        return [];
    }
    return data;
}

export async function checkInToGym(clientId) {
    const { data, error } = await supabase
        .from('gym_visits')
        .insert([{ client_id: clientId }])
        .select()
        .single();

    if (error) {
        console.error('Error checking in:', error);
        return null;
    }
    return data;
}

export async function getFoodLog(clientId, date) {
    const { data, error } = await supabase
        .from('food_log')
        .select('*')
        .eq('client_id', clientId)
        .gte('meal_time', `${date}T00:00:00`)
        .lt('meal_time', `${date}T23:59:59`)
        .order('meal_time', { ascending: false });

    if (error) {
        console.error('Error fetching food log:', error);
        return [];
    }
    return data;
}

export async function addFoodEntry(foodData) {
    const { data, error } = await supabase
        .from('food_log')
        .insert([foodData])
        .select()
        .single();

    if (error) {
        console.error('Error adding food entry:', error);
        return null;
    }
    return data;
}

export async function updateClientStatus(relationshipId, status, paymentConfirmed) {
    const { data, error } = await supabase
        .from('trainer_clients')
        .update({
            status,
            payment_confirmed: paymentConfirmed,
            membership_start: status === 'active' ? new Date().toISOString().split('T')[0] : null
        })
        .eq('id', relationshipId)
        .select()
        .single();

    if (error) {
        console.error('Error updating client status:', error);
        return null;
    }
    return data;
}

export async function getAllGymMembers() {
    const { data, error } = await supabase
        .from('gym_memberships')
        .select(`
            *,
            client:profiles!gym_memberships_client_id_fkey(*)
        `)
        .order('end_date', { ascending: true });

    if (error) {
        console.error('Error fetching gym members:', error);
        return [];
    }
    return data;
}
