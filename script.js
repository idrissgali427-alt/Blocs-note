document.addEventListener('DOMContentLoaded', () => {
    // -------------------
    // Variables et éléments du DOM
    // -------------------
    const noteList = document.getElementById('noteList');
    const newNoteBtn = document.getElementById('newNoteBtn');
    const saveNoteBtn = document.getElementById('saveNoteBtn');
    const deleteNoteBtn = document.getElementById('deleteNoteBtn');
    const noteTitleInput = document.getElementById('noteTitle');
    const noteContentDiv = document.getElementById('noteContent');
    const searchInput = document.getElementById('searchInput');
    const boldBtn = document.getElementById('boldBtn');
    const italicBtn = document.getElementById('italicBtn');
    const underlineBtn = document.getElementById('underlineBtn');
    const readNoteBtn = document.getElementById('readNoteBtn');
    const aiInput = document.getElementById('aiInput');
    const aiOutputDiv = document.getElementById('aiOutput');
    const processIdeaBtn = document.getElementById('processIdeaBtn');
    const saveAiOutputBtn = document.getElementById('saveAiOutputBtn');

    let notes = [];
    let currentNoteId = null;

    // -------------------
    // Fonctions de gestion des notes
    // -------------------

    /**
     * Charge les notes depuis le localStorage.
     */
    function loadNotes() {
        const storedNotes = localStorage.getItem('notes');
        if (storedNotes) {
            notes = JSON.parse(storedNotes);
            displayNotes(notes);
        }
    }

    /**
     * Sauvegarde les notes dans le localStorage.
     */
    function saveNotesToStorage() {
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    /**
     * Affiche les notes dans la barre latérale.
     * @param {Array} notesToDisplay - Le tableau des notes à afficher.
     */
    function displayNotes(notesToDisplay) {
        noteList.innerHTML = '';
        notesToDisplay.forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.classList.add('note-item');
            noteItem.setAttribute('data-id', note.id);
            noteItem.innerHTML = `
                <div class="note-title-preview">${note.title || 'Note sans titre'}</div>
                <div class="note-date-preview">${new Date(note.timestamp).toLocaleString()}</div>
            `;
            noteItem.addEventListener('click', () => selectNote(note.id));
            noteList.appendChild(noteItem);
        });
    }

    /**
     * Sélectionne et affiche une note existante.
     * @param {string} id - L'identifiant de la note à sélectionner.
     */
    function selectNote(id) {
        const note = notes.find(n => n.id === id);
        if (note) {
            currentNoteId = note.id;
            noteTitleInput.value = note.title;
            noteContentDiv.innerHTML = note.content;
            noteContentDiv.focus();
            deleteNoteBtn.style.display = 'inline-block';
        }
    }

    /**
     * Sauvegarde la note actuelle (création ou mise à jour).
     */
    function saveCurrentNote() {
        const title = noteTitleInput.value.trim();
        const content = noteContentDiv.innerHTML.trim();

        if (!title && !content) {
            alert('Veuillez ajouter un titre ou du contenu à la note.');
            return;
        }

        if (currentNoteId) {
            // Mise à jour d'une note existante
            const noteIndex = notes.findIndex(n => n.id === currentNoteId);
            if (noteIndex > -1) {
                notes[noteIndex].title = title;
                notes[noteIndex].content = content;
                notes[noteIndex].timestamp = new Date().toISOString();
            }
        } else {
            // Création d'une nouvelle note
            const newNote = {
                id: Date.now().toString(),
                title: title,
                content: content,
                timestamp: new Date().toISOString()
            };
            notes.push(newNote);
            currentNoteId = newNote.id;
        }

        saveNotesToStorage();
        displayNotes(notes);
        // met en évidence la note nouvellement créée ou mise à jour
        const noteElement = document.querySelector(`.note-item[data-id="${currentNoteId}"]`);
        if (noteElement) {
            noteElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            noteElement.classList.add('note-highlight');
            setTimeout(() => noteElement.classList.remove('note-highlight'), 1000);
        }
    }

    /**
     * Supprime la note actuellement sélectionnée.
     */
    function deleteCurrentNote() {
        if (currentNoteId) {
            if (confirm("Êtes-vous sûr de vouloir supprimer cette note ?")) {
                notes = notes.filter(n => n.id !== currentNoteId);
                saveNotesToStorage();
                displayNotes(notes);
                resetEditor();
            }
        }
    }

    /**
     * Réinitialise l'éditeur pour une nouvelle note.
     */
    function resetEditor() {
        currentNoteId = null;
        noteTitleInput.value = '';
        noteContentDiv.innerHTML = '';
        noteContentDiv.focus();
        deleteNoteBtn.style.display = 'none';
    }

    /**
     * Filtre les notes en fonction du terme de recherche.
     * @param {Event} event - L'événement de saisie.
     */
    function filterNotes(event) {
        const searchTerm = event.target.value.toLowerCase();
        const filteredNotes = notes.filter(note =>
            note.title.toLowerCase().includes(searchTerm) ||
            note.content.toLowerCase().includes(searchTerm)
        );
        displayNotes(filteredNotes);
    }

    /**
     * Applique un format de texte à la sélection.
     * @param {string} command - La commande de formatage (bold, italic, underline).
     */
    function formatText(command) {
        document.execCommand(command, false, null);
        noteContentDiv.focus();
    }

    /**
     * Lit le contenu de la note à haute voix.
     */
    function readNoteContent() {
        const textToRead = noteContentDiv.innerText;
        if (!textToRead) {
            alert("Rien à lire.");
            return;
        }
        const speech = new SpeechSynthesisUtterance(textToRead);
        window.speechSynthesis.speak(speech);
    }

    /**
     * Simule une réponse de l'assistant IA et l'affiche.
     */
    function processAiIdea() {
        const idea = aiInput.value.trim();
        if (!idea) {
            aiOutputDiv.innerHTML = "Veuillez décrire votre idée pour que l'assistant puisse vous aider.";
            saveAiOutputBtn.style.display = 'none';
            return;
        }

        const aiResponse = `Bonjour ! Voici une version développée de votre idée :
        
        **Titre proposé** : ${idea}

        **Description détaillée** :
        Cette idée a un grand potentiel. Pour la développer, il est crucial de définir un plan d'action clair.

        **Étapes suggérées :**
        1. **Recherche** : Faites une étude de marché pour identifier les opportunités.
        2. **Planification** : Établissez un plan détaillé avec des objectifs mesurables.
        3. **Mise en œuvre** : Commencez à travailler sur les premières étapes du projet.
        4. **Évaluation** : Analysez les résultats et ajustez votre stratégie si nécessaire.
        
        N'hésitez pas à modifier ou à ajouter des éléments pour que cela corresponde parfaitement à votre vision.`;
        
        aiOutputDiv.innerHTML = `<pre>${aiResponse}</pre>`;
        saveAiOutputBtn.style.display = 'inline-block';
    }

    /**
     * Sauvegarde la réponse de l'IA comme une nouvelle note.
     */
    function saveAiOutputAsNote() {
        const aiOutputText = aiOutputDiv.innerText;
        if (!aiOutputText) {
            alert("Il n'y a pas de contenu d'assistant à sauvegarder.");
            return;
        }
        resetEditor();
        noteTitleInput.value = 'Idée de l\'assistant IA';
        noteContentDiv.innerHTML = `<p>${aiOutputText.replace(/\n/g, '<br>')}</p>`;
        saveCurrentNote();
        // Cacher à nouveau le bouton après la sauvegarde
        saveAiOutputBtn.style.display = 'none';
    }

    // -------------------
    // Événements
    // -------------------
    newNoteBtn.addEventListener('click', resetEditor);
    saveNoteBtn.addEventListener('click', saveCurrentNote);
    deleteNoteBtn.addEventListener('click', deleteCurrentNote);
    searchInput.addEventListener('input', filterNotes);
    boldBtn.addEventListener('click', () => formatText('bold'));
    italicBtn.addEventListener('click', () => formatText('italic'));
    underlineBtn.addEventListener('click', () => formatText('underline'));
    readNoteBtn.addEventListener('click', readNoteContent);
    processIdeaBtn.addEventListener('click', processAiIdea);
    saveAiOutputBtn.addEventListener('click', saveAiOutputAsNote);

    // -------------------
    // Initialisation
    // -------------------
    loadNotes();
    // Affiche le texte par défaut pour les div contenteditable
    noteContentDiv.addEventListener('focus', function() {
        if (this.textContent === "Écrivez votre note ici...") {
            this.textContent = "";
        }
    });
    noteContentDiv.addEventListener('blur', function() {
        if (this.textContent.trim() === "") {
            this.textContent = "Écrivez votre note ici...";
        }
    });
});




//CODE DE PROTECTION



// Définis le mot de passe requis
const motDePasseRequis = '001B';

// Demande à l'utilisateur d'entrer le mot de passe
let motDePasseSaisi = prompt('Veuillez entrer le mot de passe pour accéder à l\'application.');

// Vérifie si le mot de passe saisi est correct
if (motDePasseSaisi === motDePasseRequis) {
  // Le mot de passe est correct, tu peux continuer
  alert('Accès accordé !');
  // Ici, tu peux mettre tout le code de ton application
  // Par exemple, afficher le contenu de la page
} else {
  // Le mot de passe est incorrect
  alert('Mot de passe incorrect. Accès refusé !');
  // Tu peux rediriger l'utilisateur ou cacher le contenu
  window.location.href = ''; // Exemple de redirection
}
