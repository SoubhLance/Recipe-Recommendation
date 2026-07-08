# 🍽️ Recipe Recommendation System

An AI-powered **Hybrid Recipe Recommendation System** that combines **content-based filtering**, **semantic search**, and **collaborative filtering** to deliver intelligent and personalized recipe recommendations.

The system leverages multiple datasets, modern NLP techniques, vector search, and machine learning models to recommend recipes based on ingredients, cuisine preferences, nutritional values, and user interactions.

---

## 🚀 Features

- 🔍 Semantic recipe search using Sentence-BERT
- 🥗 Ingredient-based recipe recommendations
- 🍱 Nutrition-aware ranking
- 🤝 Hybrid recommendation engine
- ⚡ Fast similarity search with FAISS
- 📊 Collaborative filtering using user interactions
- 📈 Explainable recommendations
- 🌐 FastAPI backend
- 💻 React frontend (Upcoming)

---

# 📂 Datasets

This project utilizes two publicly available datasets:

### Food.com Dataset
- Recipe metadata
- Ingredients
- Cooking instructions
- Nutrition facts
- User ratings
- User interactions

### RecipeNLG Dataset
- Large-scale recipe corpus
- Diverse cuisines
- Rich ingredient descriptions
- Natural language cooking instructions

These datasets are cleaned, standardized, and merged into a unified dataset before model training.

---

# 🏗️ Dataset Pipeline

<p align="center">
  <img width="3152" height="807" alt="Untitled-2026-07-02-1424gg" src="https://github.com/user-attachments/assets/3b45f9a7-bdf9-4591-9eb5-65a5add3e15d" />
</p>

---

# 🤖 Machine Learning Workflow

<p align="center">
<img width="2263" height="3747" alt="nnihjb" src="https://github.com/user-attachments/assets/ef0c951c-a1c1-4a11-a406-c064c7a9e9ed" />
</p>

---

# 🧠 System Architecture
<p align="center">
<img width="1975" height="5070" alt="feewnfekfe" src="https://github.com/user-attachments/assets/7a843f5f-7fbe-456f-9920-2c55829af26c" />

</p>


---

# 🛠️ Tech Stack

## Backend

- Python
- FastAPI
- Uvicorn

## Machine Learning

- Scikit-Learn
- Sentence Transformers
- FAISS
- XGBoost

## NLP

- NLTK
- SpaCy
- SBERT (all-MiniLM-L6-v2)

## Data Processing

- Pandas
- NumPy

## Database

- PostgreSQL / SQLite

## Frontend

- React
- TypeScript
- Tailwind CSS

---

# 📁 Project Structure

```text
Recipe-Recommendation/

│
├── backend/
│   ├── app/
│   ├── datasets/
│   ├── models/
│   ├── requirements.txt
│   └── main.py
│
├── frontend/
│
├── dataset pipeline.png
├── workflow of ml pipeline.png
│
└── README.md
```

---

# 🔬 Recommendation Pipeline

1. Load Food.com and RecipeNLG datasets.
2. Clean and normalize recipe data.
3. Merge into a unified dataset.
4. Perform NLP preprocessing.
5. Generate SBERT embeddings.
6. Build FAISS vector index.
7. Train collaborative filtering model.
8. Learn hybrid ranking model.
9. Retrieve and rank Top-N recipes.
10. Generate explainable recommendations.

---

# 📊 Models

### Content-Based

- TF-IDF
- Cosine Similarity
- KNN

### Semantic

- Sentence-BERT
- FAISS

### Collaborative

- SVD
- Hybrid Recommendation

### Ranking

- XGBoost Learning-to-Rank

---

# 🎯 Future Improvements

- User authentication
- Personalized recommendation profiles
- Meal planner
- Grocery list generation
- Ingredient substitution
- LLM-powered recipe assistant
- Mobile application
- Docker deployment
- Kubernetes support

---

# 📄 License

This project is intended for educational and research purposes.
