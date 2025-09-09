// Configuration Supabase - REMPLACEZ CES VALEURS !
const SUPABASE_URL = 'https://rzwksaruhkeorwlrjcbl.supabase.co'; // À remplacer
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6d2tzYXJ1aGtlb3J3bHJqY2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNzI0MjMsImV4cCI6MjA3Mjk0ODQyM30.XKj4c_cvjeTJSMaKy8-QPMY-0RWvfAN0AtjnFOmKvYc'; // À remplacer

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Composant principal
function App() {
    const [user, setUser] = React.useState(null);
    const [posts, setPosts] = React.useState([]);
    const [content, setContent] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');

    // Vérifier si l'utilisateur est connecté au chargement
    React.useEffect(() => {
        checkUser();
        fetchPosts();
        
        // Écouter les changements d'authentification
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user || null);
                if (event === 'SIGNED_IN') {
                    fetchPosts();
                    setSuccess('Connexion réussie!');
                }
                if (event === 'SIGNED_OUT') {
                    setPosts([]);
                }
            }
        );
        
        return () => subscription.unsubscribe();
    }, []);

    // Vérifier l'utilisateur actuel
    async function checkUser() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) fetchPosts();
        } catch (error) {
            setError('Erreur de connexion: ' + error.message);
        }
    }

    // Inscription
    async function handleSignUp(event) {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        const email = event.target.email.value;
        const password = event.target.password.value;
        
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });
            
            if (error) throw error;
            setSuccess('Compte créé! Vérifiez votre email pour confirmer.');
            event.target.reset();
        } catch (error) {
            setError('Erreur inscription: ' + error.message);
        }
        
        setLoading(false);
    }

    // Connexion
    async function handleSignIn(event) {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        const email = event.target.email.value;
        const password = event.target.password.value;
        
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            
            if (error) throw error;
            setSuccess('Connexion réussie!');
            event.target.reset();
        } catch (error) {
            setError('Erreur connexion: ' + error.message);
        }
        
        setLoading(false);
    }

    // Déconnexion
    async function handleSignOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setSuccess('Déconnexion réussie');
        } catch (error) {
            setError('Erreur déconnexion: ' + error.message);
        }
    }

    // Récupérer les posts
    async function fetchPosts() {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*, user:user_id(email)')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            setError('Erreur chargement posts: ' + error.message);
        }
    }

    // Créer un post
    async function handleCreatePost(event) {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        if (!content.trim()) {
            setError('Le contenu ne peut pas être vide');
            setLoading(false);
            return;
        }
        
        try {
            const { data, error } = await supabase
                .from('posts')
                .insert([{ 
                    content: content.trim(), 
                    user_id: user.id 
                }]);
            
            if (error) throw error;
            setContent('');
            setSuccess('Post créé avec succès!');
            fetchPosts();
        } catch (error) {
            setError('Erreur création post: ' + error.message);
        }
        
        setLoading(false);
    }

    return (
        <div className="container">
            <div className="header">
                <h1>🔬 Science Social</h1>
                <p>Le réseau social dédié aux passionnés de science</p>
            </div>
            
            {error && <div className="error">⚠️ {error}</div>}
            {success && <div className="success">✅ {success}</div>}
            
            {!user ? (
                <div className="auth-section">
                    <h2>Connexion / Inscription</h2>
                    <form className="auth-form" onSubmit={handleSignIn}>
                        <div className="form-group">
                            <label>Email:</label>
                            <input type="email" name="email" required />
                        </div>
                        <div className="form-group">
                            <label>Mot de passe:</label>
                            <input type="password" name="password" required minLength="6" />
                        </div>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Chargement...' : 'Se connecter'}
                        </button>
                    </form>
                    
                    <p style={{ marginTop: '15px', textAlign: 'center' }}>
                        Pas de compte? Inscrivez-vous:
                    </p>
                    
                    <form className="auth-form" onSubmit={handleSignUp}>
                        <div className="form-group">
                            <label>Email:</label>
                            <input type="email" name="email" required />
                        </div>
                        <div className="form-group">
                            <label>Mot de passe (min. 6 caractères):</label>
                            <input type="password" name="password" required minLength="6" />
                        </div>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Chargement...' : 'Créer un compte'}
                        </button>
                    </form>
                </div>
            ) : (
                <>
                    <div className="user-info">
                        <span>Connecté en tant que: <span className="user-email">{user.email}</span></span>
                        <button onClick={handleSignOut} disabled={loading}>
                            Déconnexion
                        </button>
                    </div>
                    
                    <div className="posts-section">
                        <h2>Partagez une découverte scientifique</h2>
                        <form className="post-form" onSubmit={handleCreatePost}>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Qu'avez-vous découvert aujourd'hui? Partagez une observation, une question ou une découverte scientifique..."
                                required
                                rows="4"
                            />
                            <button type="submit" disabled={loading || !content.trim()}>
                                {loading ? 'Publication...' : 'Publier'}
                            </button>
                        </form>
                        
                        <h3>Dernières publications</h3>
                        {posts.length === 0 ? (
                            <p>Aucune publication pour le moment. Soyez le premier à partager!</p>
                        ) : (
                            posts.map((post) => (
                                <div key={post.id} className="post">
                                    <div className="post-content">{post.content}</div>
                                    <div className="post-meta">
                                        <span>Par: {post.user?.email || 'Utilisateur inconnu'}</span>
                                        <span>Le: {new Date(post.created_at).toLocaleString('fr-FR')}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

// Rendu de l'application
ReactDOM.render(<App />, document.getElementById('root'));
