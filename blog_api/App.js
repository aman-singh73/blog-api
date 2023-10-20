var axios=require ('axios');
const { error } = require('console');
const express=require('express');
const _ =require('lodash');
const { title } = require('process');

const app=express();
app.use(express.json());
//lodash memoize function.
const blogs=_.memoize(async()=>{
    try{
        const reply=await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs',{
            headers:{ 'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'  }
           
        } ).catch(error => {
            throw new Error('Error fetching blog data: ' + error.message);
        });
       
        const data=reply.data;
         
        const overallBlogs=data.blogs.length;
        
        const privateBlogs=_.filter(data.blogs,blog=>_.includes(_.toLower(blog.title),'privacy'));
        console.log(privateBlogs)
        const titlesOfBlogs=_.uniqBy(data.blogs,'title').map(blog=>blog.title );
        const longTitle=_.maxBy(data.blogs,blog=>blog.title.length).title;
      

        return {
            overallBlogs,
            longTitle,
            privateBlogs:privateBlogs.length,
            titlesOfBlogs,

        };

    }
    catch(error){
        throw new Error('error in analyzing blog data');
    }
});

app.get('/api/blog-stats',async(req,res)=>{
    try{
        const blogStats=await blogs();
        res.json(blogStats);

    }
    catch (error){
res.status(500).json({error:error.message});//500(internal server error.)
    }
});

//searching blog route.

app.get('/api/blog-search', async(req,res)=>{
   const {query}=req.query;
    try {
        const blogStats=await blogs();
        const search=_.filter(blogStats.titlesOfBlogs,title=>_.includes(_.toLower(title),_.toLower(query)));
        res.json(search);
    }
    catch (error){
        res.status(500).json({error: error.message});
    }
});

const port=3000;
app.listen(port,()=>{
    console.log(`server is running on port ${port})`);
});

app.get('/',(req,res)=>{
    res.send('welcome to the blog');
});