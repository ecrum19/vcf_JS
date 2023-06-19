const { TabixIndexedFile } = require('@gmod/tabix')
const fs = require('fs')
const VCF = require('@gmod/vcf').default
const { createGunzip } = require('zlib')
const readline = require('readline')
const path = require('path')
const N3 = require('n3');

const filePath = path.join(__dirname, 'files');

// Use the vcf-js node library to iterate over the VCF file and convert useful info to RDF
const rl = readline.createInterface({
  input: fs.createReadStream(path.join(filePath, 'test.vcf.gz')).pipe(createGunzip()),
})

// Conversion of vcf data to RDF (only concerned about SNP ID, Variant allele, and Reference allele)
let header = []
let parser = undefined
const store = new N3.Store()
const { DataFactory } = N3;
const { namedNode, literal, defaultGraph, quad } = DataFactory;
const rdf_file = fs.createWriteStream(__dirname + "//data.ttl");

rl.on('line', function (line) {
  if (line.startsWith('#')) {
    header.push(line)
    return
  } else if (!parser) {
    parser = new VCF({ header: header.join('\n') })
  }
  const elt = parser.parseLine(line)


// Conversion of vcf data to RDF (only concerned about SNP ID, Variant allele, and Reference allele)
//add variant allele
store.addQuad(
    namedNode('https://www.example.com/vcf/ID#' + elt['ID']),
    namedNode('http://www.example.com/vcf/Info/Var'),
    literal(elt['ALT'])
)
});

rl.on('close', function () {
    for (const quad of store) {
        rdf_file.write('<' + quad['_subject']['id'] + '> ' +  quad['_predicate']['id'] + ' ' + quad['_object']['id'] + ' .\n\n')
        console.log(quad['_object'])
    } 
    rdf_file.close();
});

const snpThing = buildThing(createThing({ name: quad['_subject']['id'] }))
  .addIri(quad['_predicate']['id'])
  .addStringEnglish(quad['_object']['id'])
  .build();