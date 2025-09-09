import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) console.error('Error:', error)
    else setPosts(data)
  }

  useEffect(() => {
    if (user) loadPosts()
  }, [user])

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert('Erreur: ' + error.message)
    else alert('Inscription réussie! Check tes emails.')
  }

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert('Erreur: ' + error.message)
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) alert('Erreur: ' + error.message)
  }

  const addPost = async () => {
    if (!title || !content) return alert('Remplis tous les champs!')
    
    const { error } = await supabase
      .from('posts')
      .insert([{ 
        title, 
        content, 
        user_id: user.id 
      }])
    
    if (error) alert('Erreur: ' + error.message)
    else {
      setTitle('')
      setContent('')
      loadPosts()
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔬 ScienceSocial</h1>
      
      {!user ? (
        <div>
          <h2>Connexion / Inscription</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ display: 'block', margin: '10px 0', padding: '10px', width: '100%' }}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: 'block', margin: '10px 0', padding: '10px', width: '100%' }}
          />
          <div>
            <button onClick={signIn} style={{ padding: '10px 15px', margin: '5px' }}>Se connecter</button>
            <button onClick={signUp} style={{ padding: '10px 15px', margin: '5px' }}>S'inscrire</button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p>Connecté en tant que: {user.email}</p>
            <button onClick={signOut} style={{ padding: '10px 15px' }}>Déconnexion</button>
          </div>

          <div style={{ margin: '20px 0' }}>
            <h2>Nouveau post scientifique</h2>
            <input
              type="text"
              placeholder="Titre de ta recherche"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ display: 'block', margin: '10px 0', padding: '10px', width: '100%' }}
            />
            <textarea
              placeholder="Détails de ta recherche..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="4"
              style={{ display: 'block', margin: '10px 0', padding: '10px', width: '100%' }}
            />
            <button onClick={addPost} style={{ padding: '10px 15px' }}>Publier</button>
          </div>

          <div>
            <h2>Dernières publications</h2>
            {posts.map(post => (
              <div key={post.id} style={{ 
                background: '#f5f5f5', 
                padding: '15px', 
                margin: '10px 0', 
                borderRadius: '5px' 
              }}>
                <h3>{post.title}</h3>
                <p>{post.content}</p>
                <small>Posté le {new Date(post.created_at).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
