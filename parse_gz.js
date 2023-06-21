const fs = require('fs')
const VCF = require('@gmod/vcf').default
const { createGunzip } = require('zlib')
const readline = require('readline')
const path = require('path')
const {QueryEngine} = require("@comunica/query-sparql")
const N3 = require('n3');

const filePath = path.join(__dirname, 'files');

// Conversion of vcf data to RDF (only concerned about SNP ID, Variant allele, and Reference allele)
let header = []
let parser = undefined
const store = new N3.Store()
const { DataFactory } = N3
const { namedNode, literal, defaultGraph, quad } = DataFactory
const rdf_file = fs.createWriteStream(__dirname + "//data.ttl");

const id_prefix = "<https://www.example.com/vcf/ID#>";
const info_prefix = "<https://www.example.com/vcf/Info/>";
function do_vcf_parse() {
  // Use the vcf-js node library to iterate over the VCF file and convert useful info to RDF
  const rl = readline.createInterface({
    input: fs.createReadStream(path.join(filePath, 'test.vcf.gz')).pipe(createGunzip()),
  })

  rl.on('line', function (line) {
    if (line.startsWith('#')) {
      header.push(line)
      return
    } else if (!parser) {
      parser = new VCF({ header: header.join('\n') })
    }
    const elt = parser.parseLine(line)
  
    // Conversion of vcf data to RDF (only concerned about SNP ID and Variant allele)
    store.addQuad(
      namedNode('id:' + elt['ID']),
      namedNode('info:Var'),
      literal(elt['ALT'])
    )
  });
  
  rl.on('close', function () {
    rdf_file.write('@prefix id: ' + id_prefix + '\n')
    rdf_file.write('@prefix info: ' + info_prefix + '\n\n')
      for (const quad of store) {
          rdf_file.write('<' + quad['_subject']['id'] + '> ' +  quad['_predicate']['id'] + ' ' + quad['_object']['id'] + ' .\n\n')
      }; 
      rdf_file.close();
  });
} 

do_vcf_parse();
const csnpid = 'rs762551';
const output = fs.createWriteStream(__dirname + "//out.txt");

(async function query_sparql() {
  // Query for all triples in the DBpedia dataset about Belgium
  const myEngine = new QueryEngine();
  const bindingsStream = await myEngine.queryBindings(`
  PREFIX id: ${id_prefix}
  PREFIX info: ${info_prefix}
  SELECT ?o WHERE
  {
    id:${csnpid} info:Var ?o .
  }`, {
  sources: ['http://localhost:3000'],
  })
  

  bindingsStream.on('data', (binding) => {    // Prints the data fetching as it is fetched
    output.write(binding.toString());
    console.log(binding.toString());
  });

  bindingsStream.on('error', console.error);  // Prints the error if something went wrong
  bindingsStream.on('end', () => console.log('All done!')); // Prints the message when the stream is done
})();


// const curr_snp_id = document.getElementById('snp_id');
// const resultO = document.getElementById('result');



// generate.addEventListener('click', () => {
//   do_vcf_parse()
// })



// snp_id.addEventListener('click', () => {
//   exec('comunica-sparql-file-http data.ttl -p 3001', (error, stdout, stderr) => {
//   if (error) {
//     console.error(`exec error: ${error}`);
//     return;
//   }
//   console.log(`stdout: ${stdout}`);
//   console.error(`stderr: ${stderr}`);
//   });

//   const csnpid = curr_snp_id.value;

//   resultO.innerText = query_sparql(csnpid);

// })
