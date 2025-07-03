var express = require('express');
var router = express.Router();
const axios = require('axios');
const authorization = require("../middleware/authorization");
const fs = require('fs');
const { createElement } = require('react');
// const https = require('https');


/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Movie Search' });
});

//get movie by imdb 
router.get('/movies/data/:tconst', async (req, res) => {
  try {
    const movies = await req.db('basics')
      .select('*')
      .where("tconst", "=", req.params.tconst);
    res.json({ Error: false, Message: "Success", Movies: movies });
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ Error: true, Message: 'Error in MYSQL query' });
  }
});

router.get('/movies/search', async (req, res) => {
  // Get the search term from the query parameter 'title'.
  // Example URL: /movies/search?title=wind
  const searchTerm = req.query.title;

  if (!searchTerm) {
    return res.status(400).json({ Error: true, Message: 'Search term "title" is required.' });
  }

  try {

    const movies = await req.db('basics')
      .select('tconst', 'primaryTitle', 'startYear', 'titleType', 'genres')
      .where('primaryTitle', 'LIKE', `%${searchTerm}%`) // Use the LIKE operator for partial, case-insensitive matching.
      .limit(50); 

    if (movies.length === 0) {
      return res.status(404).json({ Error: false, Message: 'No movies found matching your search.', Movies: [] });
    }

    res.json({ Error: false, Message: 'Success', Movies: movies });
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ Error: true, Message: 'Error in MYSQL query' });
  }
}); 


router.get("/movies/poster/:tconst", async (req, res) => {
  try {
    const tconst = req.params.tconst || req.body.tconst;

    //Check if movie exists in your local DB similar to searchTerm check
    const localMovie = await req.db('basics')
      .select('*')
      .where("tconst", "=", tconst)
      .first();

    if (!localMovie) {
      return res.status(404).json({ Error: true, Message: `Movie with ID ${tconst} not found in local database` });
    }

    //Fetch data from OMDb API using Axios
    const response = await axios.get(`http://www.omdbapi.com/?i=${tconst}&apikey=96da0a71`);
    const data = response.data;

    if (data.Response === "False") {
      return res.status(404).json({ Error: true, Message: data.Error });
    }

    // /* Send the poster back to the client
    res.json({
      Error: false,
      Message: "Poster fetched successfully",
      Poster: data.Poster,
      Title: data.Title,
      Year: data.Year
    });
    
  } catch (error) {
    console.error('Something went wrong:', error.message);
    res.status(500).json({
      Error: true,
      Message: 'Failed to fetch poster'
    });
  }
});

router.put('/movies/poster/:tconst', async function (req, res) {
  const tconst = req.params.tconst;
  const { Poster, Title, Year } = req.body;

  // Only allow updating these fields
  const updateFields = {};
  if (Poster !== undefined) updateFields.Poster = Poster;
  if (Title !== undefined) updateFields.Title = Title;
  if (Year !== undefined) updateFields.Year = Year;

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ error: "No update data provided." });
  }

  try {
    // Update the movie in your local DB (assuming these columns exist)
    const updated = await req.db('basics')
      .where({ tconst })
      .update(updateFields);

    if (updated === 0) {
      return res.status(404).json({ message: "Movie not found or no changes made" });
    }

    res.json({ message: "Movie poster details updated successfully" });
  } catch (error) {
    console.error('Error updating movie poster:', error);
    res.status(500).json({ error: "Failed to update movie poster" });
  }
});

// POST New Movie Route
router.post('/movies', async (req, res) => {
  const newMovie = req.body; // The new movie data will be in the request body

  // Only primaryTitle and startYear are strictly required from the user's input
  const userRequiredFields = ['primaryTitle', 'startYear'];

  for (const field of userRequiredFields) {
    if (!newMovie[field]) {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }

  // These defaults ensure the database's NOT NULL constraints are satisfied.
  const defaults = {
    titleType: 'movie', // Default type if not provided
    originalTitle: newMovie.primaryTitle, // Default to primaryTitle if originalTitle not provided
    isAdult: 0, // Default to not adult
    endYear: '', // Default empty for endYear
    runtimeMinutes: '0', // Default runtime as '0' 
    genres: 'Unknown' // Default genre
  };


  // Values provided by the user will override these defaults.
  const movieToInsert = {
    // Generate a unique tconst if not provided by the user.
    // Use 'tt_gen_' to clearly indicate it's a generated ID.
    tconst: newMovie.tconst || `tt_gen_${crypto.randomUUID().replace(/-/g, '')}`,
    titleType: newMovie.titleType || defaults.titleType,
    primaryTitle: newMovie.primaryTitle, 
    originalTitle: newMovie.originalTitle || defaults.originalTitle,
    isAdult: newMovie.isAdult !== undefined ? newMovie.isAdult : defaults.isAdult,
    startYear: newMovie.startYear, 
    endYear: newMovie.endYear || defaults.endYear,
    runtimeMinutes: newMovie.runtimeMinutes || defaults.runtimeMinutes,
    genres: newMovie.genres || defaults.genres
  };

  // 4. Insert the new movie into the 'basics' table
  try {
    const [insertedId] = await req.db('basics').insert(movieToInsert); // Use movieToInsert

    // 5. Send a success response 
    res.status(201).json({
      id: insertedId, // The auto-generated ID from the database
      message: 'Movie added successfully',
      movie: movieToInsert // Echo back the movie data that was actually inserted (with defaults)
    });

  } catch (error) {
    console.error('Error adding new movie:', error);

    //Handle specific errors
    if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage.includes('idx_tconst')) {
      return res.status(409).json({ error: `Movie with this tconst (${movieToInsert.tconst}) already exists. Please provide a unique tconst or omit it for automatic generation.` });
    }

    //Handle any other unexpected errors
    res.status(500).json({ Error: true, Message: 'Failed to add movie due to a server error.' });
  }
});

module.exports = router;
