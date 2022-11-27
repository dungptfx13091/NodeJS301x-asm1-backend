const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require('cors')

const app = express();

app.use(bodyParser.json());

app.use(cors()) // Use this after the variable declaration

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

//9.Authorization
// app.use("/",function (err, req, res, next) {
//   fs.readFile(path.join(__dirname,"data","userToken.json"),"utf8",(err,data)=>{

//     const userToken = JSON.parse(data);
//     console.log(userToken);

//     if (err.name === 'UnauthorizedError') {
//       res.status(401);
//       res.json({"message" : err.name + ": " + err.message});
//     } else
//       next(err);
//   })
// });

//4. Trending Movies Route
app.get("/api/movies/trending", (req, res, next) => {
  fs.readFile(
    path.join(__dirname, "data", "movieList.json"),
    "utf8",
    (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const movieList = JSON.parse(data);

      movieList.sort(function (a, b) {
        return b.popularity - a.popularity;
      });

      const pageSize = 20;
      let page = req.query.page;
      if (page === undefined) page = 1;

      const trendingMovies = movieList.slice(
        page * pageSize - pageSize,
        page * pageSize
      );

      const total_pages = Math.ceil(movieList.length / pageSize);

      res.status(200).json({
        page: page,
        total_pages: total_pages,
        result: trendingMovies,
      });
    }
  );
});

//5. Top Rating Moives Route
app.get("/api/movies/top-rate", (req, res, next) => {
  fs.readFile(
    path.join(__dirname, "data", "movieList.json"),
    "utf8",
    (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const movieList = JSON.parse(data);

      movieList.sort(function (a, b) {
        return b.vote_average - a.vote_average;
      });

      const pageSize = 10;
      let page = req.query.page;
      if (page === undefined) page = 1;

      const topRateMovies = movieList.slice(
        page * pageSize - pageSize,
        page * pageSize
      );

      const total_pages = Math.ceil(movieList.length / pageSize);

      res.status(200).json({
        page: page,
        total_pages: total_pages,
        result: topRateMovies,
      });
    }
  );
});

//6. Movies By Genre Route
app.get("/api/movies/discover", (req, res, next) => {
  fs.readFile(path.join(__dirname,"data","genreList.json"),"utf8",(err,data)=>{
    if(err) {
      console.error(err);
      return
    }
    const genreList = JSON.parse(data)
    const idList = genreList.map(x=>x.id);

    if (!req.query.genreId)
    {res.status(400).json({message: "Not found genre parram"})}
    else {
      const genreId = Number(req.query.genreId);

      if(!(idList.includes(genreId)))
      {res.status(400).json({message: "Not found that genre id"})}
      else
      {
        const genreObj = genreList.filter(obj=>obj.id===genreId)

        fs.readFile(
          path.join(__dirname, "data", "movieList.json"),
          "utf8",
          (err, data) => {
            if (err) {
              console.error(err);
              return;
            }
            const movieList = JSON.parse(data);
      
            const pageSize = 20;
      
            let page = req.query.page;
            if (page === undefined) page = 1;
      
            const byGenreMovies = movieList.filter(item => 
              item.genre_ids && item.genre_ids.includes(genreObj[0].id)
              )
    
              const result = byGenreMovies.slice(
                page * pageSize - pageSize,
                page * pageSize
              );
              
            const total_pages = Math.ceil(movieList.length / pageSize);
    
            res.json({
              page: page,
              total_pages: total_pages,
              result: result,
              genre_name: genreObj[0].name
            });
      
          }
        );
      }
    }

    
  });
});

//7. Movie's Trailer
app.post("/api/movies/video", (req,res,next)=>{
  fs.readFile(path.join(__dirname,"data","videoList.json"),"utf8",(err,data)=>{
    if (err) {
      console.error(err)
      return
    };

    //videoList is an array of object, that each object element are {id and videos}
    const videoList=JSON.parse(data)
    const idList = videoList.map(x=>x.id)
   
    if(!req.query.film_id)
    {res.status(400).json({message: "Not found film_id parram"})}
    else
    {
      const film_id = Number(req.query.film_id);

      if (!idList.includes(film_id))
      {res.status(404).json({message: "Not found video"})}
      else
      {
        console.log(film_id)
        const videos = videoList.filter(item=>item.id===film_id)
          .map(item=>item.videos)[0];
          
        let result = videos.filter(item=>item.official)
                             .filter(item=>item.site==="YouTube")
                             .filter(item=>item.type==="Trailer")

        if (!result) result = videos.filter(item=>item.official)
                                    .filter(item=>item.site==="YouTube")
                                    .filter(item=>item.type==="Teaser")

        if (!result) {
          res.status(404).json({message: "Not found video"})
        } 
        else {
          result.sort(function (a, b) {
            return b.published_at - a.published_at;
          })  

          res.status(200).json(result[0])
        }
      }
    }
  }) 
});

//8. Seach movie
app.post("/api/movies/search",(req,res,next)=>{
  fs.readFile(path.join(__dirname,"data","movieList.json"),"utf8",(err,data)=>{
    if (err) {
      console.error(err)
      return
    }
    const movieList = JSON.parse(data)

    if (!req.query.keyword)
    {res.json({message: "Not found keyword parram"})}
    else {
      const keyword = req.query.keyword

      const pageSize = 20;
      
      let page = req.query.page;
      if (page === undefined) page = 1;
    
      const searchingMovies = movieList.filter(item => item.title && item.title.toLowerCase().includes(keyword.toLowerCase()) || item.overview && item.overview.toLowerCase().includes(keyword.toLowerCase()))

      const result = searchingMovies.slice(
        page * pageSize - pageSize,
        page * pageSize
      );
      
      const total_pages = Math.ceil(result.length / pageSize);

      res.status(200).json({
        page: page,
        total_pages: total_pages,
        result: result,
      });    }
  })
})

//10.Page Not Found
app.use((req,res,next)=>{
  res.status(404).json({message: "Page Not Found"})
})

app.listen(3001);
