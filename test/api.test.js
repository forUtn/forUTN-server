const request = require('supertest');
const app = require('../app');
const { expect } = require('chai');


describe('Testing POSTS user', () => {
  it('Should return status -> 200 and the JSON with user created', async () => {
    const newUser = {
      idcarrera : 1,
      username : 'Valentin Morali',
      mail: 'moralivalenti@gmail.com',
      pwd: 'estaesunacontrasenia'
    };
    const r = await request(app)
      .post('/users')
      .set('Accept', 'application/json')
      .send(newUser)
      .expect(200);

    console.log(r.body);
  });

});

// describe('Testing POSTS INPUTS', () => {
//     it('Should return status -> 200 and the JSON with input the message', async () => {
        
//         const newInput = {
//             idusuario: 1,
//             idmateria: 1,
//             identradapadre: 0,
//             contenido: 'Esto es un contenido creado con el test',
//             titulo:'Titulo y comentario',
//             archivos: []
//         };
//         var r = await request(app)
//             .post("/inputs")
//             .set("Accept", "application/json")
//             .send(newInput)
//             .expect(200);
//     });
// });

describe('TESTING GETS USERS', () => {
  it('Return 200 and all JSON users', async () => {
    await request(app).get('/users').expect(200);
  });

  it('Return 200 and the user with idusuario = 1', async () => {
    const r = await request(app).get('/users/1').expect(200);
    console.log(r.body.message);
  });

  it('Return 404 because not found a user', async () => {
    await request(app).get('/users/9999').expect(404);
  });
});


describe('TESTING GETS INPUTS', () => {
  it('Return 200 and the JSON with all inputs created at the moment', async () => {
    await request(app).get('/inputs').expect(200);
  });
    
  it('should show the input with id = 1', async () => {
    await request(app).get('/inputs/1').expect(200);
  });
});

// describe('Testing DELETE INPUTS', () => {
//     it('Should return status -> 200 and the JSON message:Eliminado', async () => {

//         const newInput = {
//             idusuario: 1,
//             idmateria: 1,
//             identradapadre: 0,
//             contenido: 'Esto es un contenido creado con el test',
//             titulo:'Titulo BORRAR',
//             archivos: []
//         };
//         var r = await request(app)
//             .post("/inputs")
//             .set("Accept", "application/json")
//             .send(newInput)
//         const a = "/inputs/"+r.body.message.identrada;
//         const res = await request(app)
//             .delete(a)
//             .set("Accept", "application/json")
//             .expect(200);

//         console.log(res.body.message);
//     });
// });

describe('Testing HEALTH CHECK', () => {
  it('Should return status 200 and health check response', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);
        
    console.log('Health check response:', res.body);
    expect(res.body.success).to.be.true;
    expect(res.body.message).to.include('ForUTN Server is running');
  });
});

describe('Testing FILE UPLOADS', () => {
  it('Should upload a file successfully', async () => {
    const fs = require('fs');
    const path = require('path');
        
    // Crear un archivo de prueba temporal si no existe
    const testFilePath = path.join(__dirname, 'test-file.txt');
    if (!fs.existsSync(testFilePath)) {
      fs.writeFileSync(testFilePath, 'Este es un archivo de prueba para testing');
    }

    const res = await request(app)
      .post('/files/upload')
      .attach('file', testFilePath)
      .field('tipo', 'test')
      .expect(200);

    console.log('File upload response:', res.body);
        
    // Limpiar archivo de prueba
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });
});

describe('Testing CAREERS', () => {
  it('Should get all careers', async () => {
    const res = await request(app)
      .get('/careers')
      .expect(200);
        
    console.log('Careers list:', res.body);
  });

  it.skip('Should get career by ID', async () => {
    const res = await request(app)
      .get('/careers/1')
      .expect(200);
        
    console.log('Career by ID:', res.body);
  });
});

// describe('Testing SUBJECTS', () => {
//     it('Should create a new subject', async () => {
//         const newSubject = {
//             nombre: 'Testing y Calidad de Software',
//             anio: '4',
//             idcarrera: 1
//         };

//         const res = await request(app)
//             .post("/subjects")
//             .set("Accept", "application/json")
//             .send(newSubject)
//             .expect(200);

//         console.log('Subject created:', res.body);
//     });

//     it('Should get all subjects', async () => {
//         const res = await request(app)
//             .get("/subjects")
//             .expect(200);
        
//         console.log('Subjects list:', res.body);
//     });

//     it('Should update a subject', async () => {
//         const updatedSubject = {
//             nombre: 'Testing Avanzado y QA',
//             anio: '5',
//             idcarrera: 1
//         };

//         const res = await request(app)
//             .put("/subjects/1")
//             .set("Accept", "application/json")
//             .send(updatedSubject)
//             .expect(200);

//         console.log('Subject updated:', res.body);
//     });
// });

describe('Testing CALIFICATIONS (Voting System)', () => {
  it('Should create a new calification/vote', async () => {
    const newCalification = {
      idusuario: 1,
      identrada: 1,
      tipoclasificacion: 'upvote'
    };

    const res = await request(app)
      .post('/califications')
      .set('Accept', 'application/json')
      .send(newCalification)
      .expect(200);

    console.log('Calification created:', res.body);
  });

  it('Should get all califications', async () => {
    const res = await request(app)
      .get('/califications')
      .expect(200);
        
    console.log('Califications list:', res.body);
  });

  // it('Should update a calification from upvote to downvote', async () => {
  //     const updatedCalification = {
  //         idusuario: 1,
  //         identrada: 1,
  //         tipoclasificacion: 'downvote'
  //     };

  //     const res = await request(app)
  //         .put("/califications/1")
  //         .set("Accept", "application/json")
  //         .send(updatedCalification)
  //         .expect(200);

  //     console.log('Calification updated:', res.body);
  // });
});

// describe('Testing INPUT with FILE ATTACHMENT', () => {
//     it('Should create an input with file attachment', async () => {
//         const fs = require('fs');
//         const path = require('path');
        
//         // Crear archivo de prueba
//         const testFilePath = path.join(__dirname, 'attachment-test.pdf');
//         if (!fs.existsSync(testFilePath)) {
//             fs.writeFileSync(testFilePath, 'PDF content simulation for testing');
//         }

//         // Primero subir el archivo
//         const fileRes = await request(app)
//             .post("/files")
//             .attach('file', testFilePath)
//             .field('tipo', 'pdf');

//         // Luego crear el input con referencia al archivo
//         const newInputWithFile = {
//             idusuario: 1,
//             idmateria: 1,
//             identradapadre: 0,
//             contenido: 'Este post tiene un archivo adjunto',
//             titulo: 'Post con archivo PDF',
//             archivos: [fileRes.body.message?.idarchivo || 1]
//         };

//         const res = await request(app)
//             .post("/inputs")
//             .set("Accept", "application/json")
//             .send(newInputWithFile)
//             .expect(200);

//         console.log('Input with file created:', res.body);
        
//         // Limpiar archivo de prueba
//         if (fs.existsSync(testFilePath)) {
//             fs.unlinkSync(testFilePath);
//         }
//     });
// });

describe('Testing SEARCH FUNCTIONALITY', () => {
  // it('Should search inputs by keyword', async () => {
  //     const searchTerm = 'contenido';
  //     const res = await request(app)
  //         .get(`/inputs/search/${searchTerm}`)
  //         .expect(200);
        
  //     console.log('Search results:', res.body);
  // });

  // it('Should return empty results for non-existent search term', async () => {
  //     const searchTerm = 'palabrainexistente123';
  //     const res = await request(app)
  //         .get(`/inputs/search/${searchTerm}`)
  //         .expect(200);
        
  //     console.log('Empty search results:', res.body);
  // });
});