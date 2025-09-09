// Configuration Supabase
const SUPABASE_URL = 'https://votre-projet.supabase.co';
const SUPABASE_ANON_KEY = 'votre-cle-anon-supabase';

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
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user || null);
                if (event === 'SIGNED_IN') {
                    fetchPosts();
                }
            }
        );
        
        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    // Vérifier l'utilisateur actuel
    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    }

    // Inscription
    async function handleSignUp(event) {
        event.preventDefault();
        setLoading(true);
        setError('');
        
        const email = event.target.email.value;
        const password = event.target.password.value;
        
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        
        if (error) {
            setError(error.message);
        } else {
            setSuccess('Compte créé avec succès! Veuillez vérifier votre email.');
        }
        
        setLoading(false);
    }

    // Connexion
    async function handleSignIn(event) {
        event.preventDefault();
        setLoading(true);
        setError('');
        
        const email = event.target.email.value;
        const password = event.target.password.value;
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        
        if (error) {
            setError(error.message);
        } else {
            setSuccess('Connexion réussie!');
        }
        
        setLoading(false);
    }

    // Déconnexion
    async function handleSignOut() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            setError(error.message);
        }
    }

    // Récupérer les posts
    async function fetchPosts() {
        const { data, error } = await supabase
            .from('posts')
            .select('*, user:user_id(email)')
            .order('created_at', { ascending: false });
        
        if (error) {
            setError(error.message);
        } else {
            setPosts(data);
        }
    }

    // Créer un post
    async function handleCreatePost(event) {
        event.preventDefault();
        setLoading(true);
        setError('');
        
        if (!content.trim()) {
            setError('Le contenu ne peut pas être vide');
            setLoading(false);
            return;
        }
        
        const { data, error } = await supabase
            .from('posts')
            .insert([{ content, user_id: user.id }]);
        
        if (error) {
            setError(error.message);
        } else {
            setContent('');
            setSuccess('Post créé avec succès!');
            fetchPosts(); // Rafraîchir les posts
        }
        
        setLoading(false);
    }

    return (
        <div className="container">
            <div className="header">
                <h1>🔬 Science Social</h1>
                <p>Le réseau social dédié aux passionnés de science</p>
            </div>
            
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            
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
                            <input type="password" name="password" required />
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
                            <label>Mot de passe:</label>
                            <input type="password" name="password" required />
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
                        <button onClick={handleSignOut}>Déconnexion</button>
                    </div>
                    
                    <div className="posts-section">
                        <h2>Partagez une découverte scientifique</h2>
                        <form className="post-form" onSubmit={handleCreatePost}>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Qu'avez-vous découvert aujourd'hui?"
                                required
                            />
                            <button type="submit" disabled={loading}>
                                {loading ? 'Publication...' : 'Publier'}
                            </button>
                        </form>
                        
                        <h3>Dernières publications</h3>
                        {posts.length === 0 ? (
                            <p>Aucune publication pour le moment.</p>
                        ) : (
                            posts.map((post) => (
                                <div key={post.id} className="post">
                                    <div className="post-content">{post.content}</div>
                                    <div className="post-meta">
                                        <span>Par: {post.user?.email}</span>
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
