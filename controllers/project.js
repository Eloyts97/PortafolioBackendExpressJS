'use strict'

var Project = require('../models/project');
var fs = require('fs');
var path = require('path');

var controller = {
    home: function(req, res) {
        res.status(200).send(
            'Página de home'
        );
    },
    
    test: function(req, res) {
        res.status(200).send(
            'Página de test'
        );
    },

    saveProject: function(req, res) {
        var project = new Project();

        var params = req.body;
        project.name = params.name;
        project.description = params.description;
        project.category = params.category;
        project.year = params.year;
        project.langs = params.langs;
        project.image = null;

        project.save((err, projectStored) => {
            if(err) return res.status(500).send({message: 'Error al guardar el documento.'});

            if(!projectStored) return res.status(404).send({message: 'No se ha podido guardar el projecto'});

            return res.status(200).send({project: projectStored});
        });

    },

    getProject: function(req, res) {
        var projectId = req.params.id;

        if(projectId == null) return res.status(404).send({message: 'El proyecto no existe'});

        Project.findById(projectId, (err, project) => {
            if(err) return res.status(500).send({message: 'Error al buscar el documento.'});

            if(!project) return res.status(404).send({message: 'El proyecto no existe'});

            return res.status(200).send({project: project});
        });
    },
    
    getProjects: function(req, res) {
        Project.find({}).sort('-year').exec((err, projects) => {
            if(err) return res.status(500).send({message: 'Error al buscar los documentos.'});

            if(!projects) return res.status(404).send({message: 'No existen proyectos'});

            return res.status(200).send({projects});
        });

    },

    updateProject: function(req, res) {
        var projectId = req.params.id;
        var update = req.body;

        Project.findByIdAndUpdate(projectId, update, {new:true}, (err, projectUpdated) => {
            if(err) return res.status(500).send({message: 'Error al actualizar el documento.'});

            if(!projectUpdated) return res.status(404).send({message: 'No existe el proyecto'});

            return res.status(200).send({project: projectUpdated});
        });

    },

    deleteProject: function(req, res) {
        var projectId = req.params.id;

        Project.findByIdAndDelete(projectId, (err, projectDelete) => {
            if(err) return res.status(500).send({message: 'Error al borrar el documento.'});

            if(!projectDelete) return res.status(404).send({message: 'No existe el proyecto'});

            return res.status(200).send({project: projectDelete});
        });
    },

    uploadImage: function(req, res) {
        var projectId = req.params.id;
        var fileName = 'Imagen no subida';

        if(req.files) {
            var filePath = req.files.image.path;
            var fileSplit = filePath.split('\\');
            var fileName = fileSplit[1];
            var extSplit = fileName.split('\.');
            var fileExt = extSplit[1];

            if(fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif') {
                Project.findByIdAndUpdate(projectId, {image: fileName}, {new: true}, (err, projectUpdated) => {
                    if(err) return res.status(500).send({message: 'Error al subir imagen.'});
    
                    if(!projectUpdated) return res.status(404).send({message: 'No existe el proyecto'});
    
                    return res.status(200).send({project: projectUpdated});
                });
            } else {
                fs.unlink(filePath, (err) => {
                    return res.status(200).send({message: 'La extensión no es válida'});
                });
            }

            

        } else {
            return res.status(200).send({
                message: fileName
            });
        }
    },

    getImageFile: function(req, res) {
        var file = req.params.image;
        var path_file = './uploads/'+file;
        
        fs.exists(path_file, (exists) => {
            if(exists) {
                return res.sendFile(path.resolve(path_file))
            } else {
                return res.status(200).send({
                    message: 'No existe la imagen'
                });
            }
        });
    }
};

module.exports = controller;