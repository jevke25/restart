import { supabase } from './supabaseClient.js';

export async function handleLogin(username, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: username,
            password: password,
        });

        if (error) throw error;

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

        if (profileError) throw profileError;

        return {
            success: true,
            user: {
                id: data.user.id,
                email: data.user.email,
                type: profile?.role || 'client',
                name: profile?.full_name || username,
            },
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}

export async function handleSignup(email, password, fullName, role) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) throw error;

        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: data.user.id,
                    email: email,
                    full_name: fullName,
                    role: role,
                },
            ]);

        if (profileError) throw profileError;

        return {
            success: true,
            user: {
                id: data.user.id,
                email: email,
                type: role,
                name: fullName,
            },
        };
    } catch (error) {
        console.error('Signup error:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}

export async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }
}

export async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) return null;

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError) throw profileError;

        return {
            id: user.id,
            email: user.email,
            type: profile?.role || 'client',
            name: profile?.full_name || user.email,
        };
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
}

export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
        (async () => {
            if (session?.user) {
                const user = await getCurrentUser();
                callback(event, user);
            } else {
                callback(event, null);
            }
        })();
    });
}
