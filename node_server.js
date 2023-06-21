/** 
 * The following workflow is performed by this webpage and JS script
 * 1. Reads specified VCF file from provided URL
 * 2. Parses VCF file and converts data relevant to the question posed by the challenge (using the ____ library?) to triples
 * 3. RDF triple Knowledge graphs are stored in local server (could be Solid pods but not enough time to complete this)
 * 4. Data stores are queried to find SNP variant data designated by the user
*/

// import statements
const express = require('express');
const fileUpload = require("express-fileupload");
const path = require("path");

const port = 3000; // Change the port number if needed

const app = express();

// file upload route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


// uploads the zipped vcf.gz file we want to use for analysis
app.post('/upload', 
  fileUpload({ createParentPath: true }),
  (req, res) => {
    const files = req.files
    console.log(files)

    // Saves files to server using mv function
    Object.keys(files).forEach(key => {
      const filepath = path.join(__dirname, 'files', files[key].name)
      files[key].mv(filepath, (err) => {
          if (err) return res.status(500).json({ status: "error", message: err })
      })
    })

    return res.json({ status: 'Success', message: Object.keys(files).toString() })
  }  
)


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
