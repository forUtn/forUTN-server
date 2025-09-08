const request = require("supertest");
const app = require("../app");


describe('Testing POSTS user', () => {
    it('Should return status -> 200 and the JSON with user created', async () => {
        const newUser = {
            idcarrera : 1,
            username : 'Valentin Morali',
            mail: 'moralivalenti@gmail.com',
            pwd: 'estaesunacontrasenia'
        };
        const r = await request(app)
            .post("/users")
            .set("Accept", "application/json")
            .send(newUser)
            .expect(200);

        console.log(r.body);
    });

});

describe('Testing POSTS INPUTS', () => {
    it('Should return status -> 200 and the JSON with input the message', async () => {
        
        const newInput = {
            idusuario: 1,
            idmateria: 1,
            identradapadre: 0,
            contenido: 'Esto es un contenido creado con el test',
            titulo:'Titulo y comentario',
            archivos: []
        };
        var r = await request(app)
            .post("/inputs")
            .set("Accept", "application/json")
            .send(newInput)
            .expect(200);
    });
});

describe('TESTING GETS USERS', () => {
    it('Return 200 and all JSON users', async () => {
        await request(app).get("/users").expect(200);
    });

    it('Return 200 and the user with idusuario = 1', async () => {
        const r = await request(app).get("/users/1").expect(200);
        console.log(r.body.message);
    });

    it('Return 404 because not found a user', async () => {
        await request(app).get("/users/9999").expect(404);
    });
});


describe('TESTING GETS INPUTS', () => {
    it('Return 200 and the JSON with all inputs created at the moment', async () => {
        await request(app).get("/inputs").expect(200);
    });
    
    it('should show the input with id = 1', async () => {
        await request(app).get("/inputs/1").expect(200);
    });
});

describe('Testing DELETE INPUTS', () => {
    it('Should return status -> 200 and the JSON message:Eliminado', async () => {

        const newInput = {
            idusuario: 1,
            idmateria: 1,
            identradapadre: 0,
            contenido: 'Esto es un contenido creado con el test',
            titulo:'Titulo BORRAR',
            archivos: []
        };
        var r = await request(app)
            .post("/inputs")
            .set("Accept", "application/json")
            .send(newInput)
        const a = "/inputs/"+r.body.message.identrada;
        const res = await request(app)
            .delete(a)
            .set("Accept", "application/json")
            .expect(200);

        console.log(res.body.message);
    });

});