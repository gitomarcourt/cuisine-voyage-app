import tkinter as tk
from tkinter import ttk
import threading
from generate_recipe import generate_recipe
import time
import json
import os

class RecipeGeneratorApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("✨ Générateur de Recettes Magiques")
        self.root.geometry("800x600")
        
        # Configuration style
        self.style = ttk.Style()
        self.style.configure("Title.TLabel", font=("Helvetica", 24))
        self.style.configure("Error.TLabel", foreground="red")
        self.style.configure("Success.TLabel", foreground="green")
        
        # État de la génération
        self.current_recipe = None
        self.generation_state = {}
        
        self.create_widgets()
        
    def create_widgets(self):
        # Frame principal
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Titre
        title = ttk.Label(main_frame, 
                         text="✨ Générateur de Recettes Magiques", 
                         style="Title.TLabel")
        title.pack(pady=20)
        
        # Frame pour l'entrée
        input_frame = ttk.Frame(main_frame)
        input_frame.pack(pady=20, fill=tk.X)
        
        # Champ de saisie
        self.recipe_entry = ttk.Entry(input_frame, font=("Helvetica", 14))
        self.recipe_entry.pack(side=tk.LEFT, expand=True, fill=tk.X, padx=(0, 10))
        self.recipe_entry.insert(0, "Entrez le nom de votre recette...")
        self.recipe_entry.bind("<FocusIn>", self.clear_placeholder)
        
        # Bouton de génération
        self.generate_btn = ttk.Button(input_frame, 
                                     text="Générer ✨",
                                     command=self.start_generation)
        self.generate_btn.pack(side=tk.RIGHT)
        
        # Frame pour les étapes
        self.steps_frame = ttk.LabelFrame(main_frame, text="Progression", padding="10")
        self.steps_frame.pack(fill=tk.X, pady=20)
        
        # Étapes de progression
        self.steps = [
            ("🌍 Infos générales", self.generate_general_info),
            ("📝 Ingrédients", self.generate_ingredients),
            ("👩‍🍳 Étapes", self.generate_steps),
            ("🎵 Playlist", self.generate_playlist),
            ("🍷 Vin", self.generate_wine),
            ("💾 Sauvegarde", self.save_recipe)
        ]
        
        self.step_frames = []
        self.step_labels = []
        self.step_progresses = []
        self.retry_buttons = []
        self.step_status = []
        
        for i, (step_text, _) in enumerate(self.steps):
            step_frame = ttk.Frame(self.steps_frame)
            step_frame.pack(fill=tk.X, pady=5)
            
            # Label de l'étape
            label = ttk.Label(step_frame, text=step_text, width=20)
            label.pack(side=tk.LEFT)
            
            # Statut de l'étape
            status_label = ttk.Label(step_frame, text="En attente...", width=15)
            status_label.pack(side=tk.LEFT, padx=5)
            
            # Bouton de relance
            retry_btn = ttk.Button(step_frame, text="🔄",
                                 command=lambda idx=i: self.retry_step(idx))
            retry_btn.pack(side=tk.RIGHT, padx=5)
            retry_btn.pack_forget()
            
            # Barre de progression
            progress = ttk.Progressbar(step_frame, length=300, mode="determinate")
            progress.pack(side=tk.RIGHT, padx=5)
            
            self.step_frames.append(step_frame)
            self.step_labels.append(label)
            self.step_progresses.append(progress)
            self.retry_buttons.append(retry_btn)
            self.step_status.append(status_label)
        
        # Zone de statut
        self.status_label = ttk.Label(main_frame, text="En attente de votre recette...", 
                                    font=("Helvetica", 10))
        self.status_label.pack(pady=20)
    
    def clear_placeholder(self, event):
        if self.recipe_entry.get() == "Entrez le nom de votre recette...":
            self.recipe_entry.delete(0, tk.END)
    
    def update_step_status(self, step_index, status, is_error=False):
        if is_error:
            self.step_status[step_index].configure(text=status, style="Error.TLabel")
            self.retry_buttons[step_index].pack(side=tk.RIGHT, padx=5)
        else:
            self.step_status[step_index].configure(text=status, style="Success.TLabel")
            self.retry_buttons[step_index].pack_forget()
    
    def update_progress(self, step_index, progress):
        self.step_progresses[step_index]["value"] = progress
        self.root.update_idletasks()
    
    def save_progress(self):
        if self.current_recipe:
            progress_file = f"{self.current_recipe.replace(' ', '_').lower()}_progress.json"
            with open(progress_file, "w", encoding="utf-8") as f:
                json.dump(self.generation_state, f, ensure_ascii=False, indent=2)
    
    def load_progress(self, recipe_name):
        progress_file = f"{recipe_name.replace(' ', '_').lower()}_progress.json"
        if os.path.exists(progress_file):
            with open(progress_file, "r", encoding="utf-8") as f:
                self.generation_state = json.load(f)
                return True
        return False
    
    def retry_step(self, step_index):
        if self.current_recipe:
            self.step_progresses[step_index]["value"] = 0
            self.update_step_status(step_index, "Relance...", False)
            thread = threading.Thread(target=self.steps[step_index][1], args=(self.current_recipe,))
            thread.start()
    
    def generate_general_info(self, recipe_name):
        try:
            for j in range(0, 101, 10):
                self.root.after(0, self.update_progress, 0, j)
                time.sleep(0.1)
            self.generation_state["general_info"] = {"status": "success"}
            self.update_step_status(0, "✅ Complété")
            self.save_progress()
        except Exception as e:
            self.generation_state["general_info"] = {"status": "error", "message": str(e)}
            self.update_step_status(0, "❌ Erreur", True)
            self.save_progress()
            raise e
    
    def generate_ingredients(self, recipe_name):
        try:
            for j in range(0, 101, 10):
                self.root.after(0, self.update_progress, 1, j)
                time.sleep(0.1)
            self.generation_state["ingredients"] = {"status": "success"}
            self.update_step_status(1, "✅ Complété")
            self.save_progress()
        except Exception as e:
            self.generation_state["ingredients"] = {"status": "error", "message": str(e)}
            self.update_step_status(1, "❌ Erreur", True)
            self.save_progress()
            raise e
    
    def generate_steps(self, recipe_name):
        try:
            for j in range(0, 101, 10):
                self.root.after(0, self.update_progress, 2, j)
                time.sleep(0.1)
            self.generation_state["steps"] = {"status": "success"}
            self.update_step_status(2, "✅ Complété")
            self.save_progress()
        except Exception as e:
            self.generation_state["steps"] = {"status": "error", "message": str(e)}
            self.update_step_status(2, "❌ Erreur", True)
            self.save_progress()
            raise e
    
    def generate_playlist(self, recipe_name):
        try:
            for j in range(0, 101, 10):
                self.root.after(0, self.update_progress, 3, j)
                time.sleep(0.1)
            self.generation_state["playlist"] = {"status": "success"}
            self.update_step_status(3, "✅ Complété")
            self.save_progress()
        except Exception as e:
            self.generation_state["playlist"] = {"status": "error", "message": str(e)}
            self.update_step_status(3, "❌ Erreur", True)
            self.save_progress()
            raise e
    
    def generate_wine(self, recipe_name):
        try:
            for j in range(0, 101, 10):
                self.root.after(0, self.update_progress, 4, j)
                time.sleep(0.1)
            self.generation_state["wine"] = {"status": "success"}
            self.update_step_status(4, "✅ Complété")
            self.save_progress()
        except Exception as e:
            self.generation_state["wine"] = {"status": "error", "message": str(e)}
            self.update_step_status(4, "❌ Erreur", True)
            self.save_progress()
            raise e
    
    def save_recipe(self, recipe_name):
        try:
            for j in range(0, 101, 10):
                self.root.after(0, self.update_progress, 5, j)
                time.sleep(0.1)
            
            sql_output = generate_recipe(recipe_name)
            filename = f"{recipe_name.replace(' ', '_').lower()}.sql"
            
            with open(filename, "w", encoding="utf-8") as f:
                f.write(sql_output)
            
            self.generation_state["save"] = {"status": "success", "filename": filename}
            self.update_step_status(5, "✅ Complété")
            self.save_progress()
        except Exception as e:
            self.generation_state["save"] = {"status": "error", "message": str(e)}
            self.update_step_status(5, "❌ Erreur", True)
            self.save_progress()
            raise e
    
    def start_generation(self):
        recipe_name = self.recipe_entry.get()
        if recipe_name and recipe_name != "Entrez le nom de votre recette...":
            self.current_recipe = recipe_name
            self.generate_btn["state"] = "disabled"
            self.status_label["text"] = "Génération en cours..."
            
            # Réinitialiser les barres de progression
            for progress in self.step_progresses:
                progress["value"] = 0
            
            # Réinitialiser l'état de génération
            self.generation_state = {}
            
            # Vérifier s'il existe une progression sauvegardée
            if self.load_progress(recipe_name):
                self.status_label["text"] = "Reprise de la génération précédente..."
            
            # Lancer la génération dans un thread séparé
            thread = threading.Thread(target=self.generate_recipe_thread, args=(recipe_name,))
            thread.start()
    
    def generate_recipe_thread(self, recipe_name):
        try:
            for i, (_, step_function) in enumerate(self.steps):
                if not self.generation_state.get(f"step_{i}", {}).get("status") == "success":
                    try:
                        step_function(recipe_name)
                    except Exception as e:
                        self.root.after(0, self.generation_error, f"Erreur à l'étape {i+1}: {str(e)}")
                        return
            
            self.root.after(0, self.generation_complete, recipe_name)
            
        except Exception as e:
            self.root.after(0, self.generation_error, str(e))
    
    def generation_complete(self, recipe_name):
        filename = f"{recipe_name.replace(' ', '_').lower()}.sql"
        self.status_label["text"] = f"✅ Recette générée avec succès ! Fichier : {filename}"
        self.generate_btn["state"] = "normal"
    
    def generation_error(self, error):
        self.status_label["text"] = f"❌ Erreur : {error}"
        self.generate_btn["state"] = "normal"
    
    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    app = RecipeGeneratorApp()
    app.run() 