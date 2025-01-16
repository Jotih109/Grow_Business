const psql = require('./connector');

async function qualLogin(dados) {
    const conexao = psql.conexao();
    let retorno;

    try {
        const chamada = await conexao.query(`
                        SELECT
                count(*) AS qtd,
                'usuario' AS tipo
            FROM
                usuario
            WHERE
                email = '${dados.email}'
            AND 
                senha = '${dados.password}'
            union
            SELECT
                count(*) AS qtd,
                'empresa' AS tipo
            FROM
                empresa
            WHERE
                email = '${dados.email}'
            AND 
                senha = '${dados.password}'
        `)

        retorno = {
            sucesso: true,
            resposta: chamada.rows
        }


    } catch (erro) {
        return retorno = { erro: erro, sucesso: false }
    }
    conexao.end();
    return retorno
}

async function checaporEmail(dados) {
    const conexao = psql.conexao();
    let retorno;
    try {
        const chamada = await conexao.query(`
             SELECT
                count(*) AS qtd,
                'usuario' AS tipo
            FROM
                usuario
            WHERE
                email = '${dados.email}'
            union
            SELECT
                count(*) AS qtd,
                'empresa' AS tipo
            FROM
                empresa
            WHERE
                email = '${dados.email}'
        `)
        retorno = {
            sucesso: true,
            resposta: chamada.rows
        }
    } catch (erro) {
        retorno = { erro: erro, sucesso: false }
    }
    return retorno;
}

async function resetSenha(dados) {
    const conexao = psql.conexao();
    let retorno;
    try {
        let listaEmails = await conexao.query(`
            (
                SELECT email, senha, cpf FROM usuario WHERE email = '${dados.email}')
                UNION ALL (SELECT email, senha, cnpj FROM empresa
                WHERE email = '${dados.email}');
            `);
        listaEmails = listaEmails.rows;

        if (listaEmails.length < 1) {
            throw "Nenhum usuário encontrado!";
        }
        const chamada = await conexao.query(`
            UPDATE ${listaEmails[0].cpf.length == 14 ? "EMPRESA" : "USUARIO"}
            SET SENHA = '${dados.novaSenha}'
            WHERE email = '${dados.email}';
            `)
        retorno = {
            sucesso: true,
            resposta: chamada
        }
    } catch (erro) {
        retorno = { erro: erro, sucesso: false }
    }
    return retorno;
}

async function existeEmail(dados) {
    console.log(dados.email);

    const conexao = psql.conexao();
    let resposta;
    try {
        const consulta = await conexao.query(
            `
            SELECT COUNT(*) 
            FROM (
                SELECT email FROM usuario 
                UNION 
                SELECT email FROM empresa
            ) AS emails
            WHERE email = $1
            `,
            [dados.email] // Usa parâmetros para prevenir SQL Injection
        );

        resposta = {
            sucesso: true,
            info: consulta.rows,
        };
    } catch (erro) {
        resposta = {
            sucesso: false,
            retorno: `Ocorreu o erro: ${erro}`,
        };
    } finally {
        conexao.end(); // Garante que a conexão será fechada
    }
    return resposta;
}


exports.existeEmail = existeEmail;
exports.qualLogin = qualLogin;
exports.checaporEmail = checaporEmail;
exports.resetSenha = resetSenha;