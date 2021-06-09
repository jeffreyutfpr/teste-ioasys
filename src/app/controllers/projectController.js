const express = require('express');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');
const authMiddleware = require('../middlewares/auth')

const Movie = require('../models/movie');
const Star = require('../models/star');
const User = require('../models/user');

const router = express.Router();

router.use(authMiddleware);

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    });
}

async function verificarPermissao(req, res, next) {

    const authHeader = req.headers.authorization;
    const parts = authHeader.split(' ')
    const [scheme, token] = parts;
    const { id } = jwt.decode(token)
    const usuario = await User.findById(id)

    if (usuario.profile === 1)
        next()
    else
        res.status(403).json({ error: 'Sem permissão! Apenas ADM tem acesso a esse recurso!' })
}

router.post('/register-admin', verificarPermissao, async (req, res) => {
    const { email } = req.body;

    try {
        if (await User.findOne({ email }))
            return res.status(400).send({ error: 'Usuário já existe!' });

        req.body.profile = 1

        const user = await User.create(req.body);

        user.password = undefined;

        return res.send({
            user,
            token: generateToken({ id: user.id }),
        });
    } catch (err) {
        return res.status(400).send({ error: 'Falha no registro!' })
    }
});

router.put('/admin-user-edit/:userId', verificarPermissao, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.userId, {
            name: req.body.name,
            email: req.body.email,
            status: req.body.status,
            profile: req.body.profile
        }, { new: true });
        return res.send({ user });
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao editar usuário!' });
    }
});

router.put('/inactivate-user-admin/:userId', verificarPermissao, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.userId, {
            status: false,
        }, { new: true });
        return res.send({ user });
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao inativar usuário!' });
    }
});

router.put('/user-edit/', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const parts = authHeader.split(' ')
        const [scheme, token] = parts;
        const { id } = jwt.decode(token)
        const usuario = await User.findById(id)

        const user = await User.findByIdAndUpdate(usuario, {
            name: req.body.name,
            email: req.body.email,
            status: req.body.status
        }, { new: true });
        return res.send({ user });
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao editar cadastro!' });
    }
});

router.put('/user-inactive/', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const parts = authHeader.split(' ')
        const [scheme, token] = parts;
        const { id } = jwt.decode(token)
        const usuario = await User.findById(id)

        const user = await User.findByIdAndUpdate(usuario, {
            status: false
        }, { new: true });
        return res.send({ user });
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao inativar cadastro!' });
    }
});

async function verificarUser(req, res, next) {

    const authHeader = req.headers.authorization;
    const parts = authHeader.split(' ')
    const [scheme, token] = parts;
    const { id } = jwt.decode(token)
    const usuario = await User.findById(id)

    if (usuario.profile === 2)
        next()
    else
        res.status(403).json({ error: 'Somente usuários podem votar!' })
}

router.post('/movie/', verificarPermissao, async (req, res) => {
    try {
        const movie = await Movie.create(req.body);

        return res.send({ movie });
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao criar no filme!' });
    }
});

router.post('/movie-star/', verificarUser, async (req, res) => {
    try {
        if (req.body.star >= 0 && req.body.star <= 4) {
            const authHeader = req.headers.authorization;
            const parts = authHeader.split(' ')
            const [scheme, token] = parts;
            const { id } = jwt.decode(token)
            const usuario = await User.findById(id)
            req.body.user = usuario

            const star = await Star.create(req.body)

            return res.send({ star });
        } else console.error(error);
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao votar no filme! Válido apenas de 0 a 4!' });
    }
});

router.get('/movie-list-genre/', async (req, res) => {
    try {
        const movie = await Movie.find({
            genre: req.query.search
        });

        return res.send({ movie })
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao procurar genero!' });
    }

});

router.get('/movie-list-title/', async (req, res) => {
    try {
        const movie = await Movie.find({
            title: req.query.search
        });

        return res.send({ movie })
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao procurar titulo!' });
    }

});

router.get('/movie-list-director/', async (req, res) => {
    try {
        const movie = await Movie.find({
            director: req.query.search
        });

        return res.send({ movie })
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao procurar titulo!' });
    }

});

router.get('/movie/:movieId', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.movieId);

        return res.send({ movie })
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao procurar o filme!' });
    }
});

router.put('/movie/:movieId', verificarPermissao, async (req, res) => {
    try {
        const movie = await Movie.findByIdAndUpdate(req.params.movieId, {
            title: req.body.title,
            description: req.body.description,
            director: req.body.director,
            genres: req.body.genres,
            status: req.body.status,
        }, { new: true });
        return res.send({ movie });
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao editar no filme!' });
    }
});

router.delete('/movie/:movieId', async (req, res) => {
    try {
        const movie = await Movie.findByIdAndUpdate(req.params.movieId, {
            status: false
        }, { new: true });
        return res.send({ movie });
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao excluir filme!' });
    }
});

router.get('/movie-star/:movieId', async (req, res) => {
    try {
        const star = await Star.find({ movie: req.params.movieId })
        media = star.reduce((accumulator, currentItem) => accumulator + currentItem.star, 0) / star.length

        return res.send({ media })
    } catch (err) {
        return res.status(400).send({ error: 'Erro ao fazer media das notas!' });
    }
});

module.exports = app => app.use('/project', router);