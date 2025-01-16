const pg = require('pg');

function conexao() {
    const dados = {
        host: 'localhost',
        port: '5432',
        user: 'docker',
        password: 'docker',
        database: 'postgres'
    };
    const con = new pg.Pool(dados);
    return con
}
exports.conexao = conexao;