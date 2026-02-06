const { Document, User } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const fs = require('fs').promises;
const path = require('path');

const uploadDocument = async (req, res) => {
  try {
    const { title, description, department } = req.body;
    const createdBy = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const document = await Document.create({
      title: title || req.file.originalname,
      description,
      filePath: req.file.path,
      fileName: req.file.filename,
      fileSize: req.file.size,
      mimetype: req.file.mimetype,
      createdBy,
      department: department || req.user.department
    });

    logger.info(`Document uploaded: ${document.id}`);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error) {
    logger.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getDocuments = async (req, res) => {
  try {
    const { department, title, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    const where = {
      [Op.or]: [
        { createdBy: userId }
      ]
    };

    if (department) {
      where[Op.or].push({ department });
    }

    if (title) {
      where.title = { [Op.iLike]: `%${title}%` };
    }

    const { count, rows } = await Document.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    logger.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Construct full file path
    const filePath = path.join(process.cwd(), document.filePath);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.download(filePath, document.fileName);

    logger.info(`Document downloaded: ${id}`);
  } catch (error) {
    logger.error('Download document error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user.id;

    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (document.createdBy !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await document.update({ title, description });

    logger.info(`Document updated: ${id}`);

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: document
    });
  } catch (error) {
    logger.error('Update document error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (document.createdBy !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete file from filesystem
    try {
      const filePath = path.join(process.cwd(), document.filePath);
      await fs.unlink(filePath);
    } catch (fileError) {
      logger.warn(`Could not delete file for document ${id}:`, fileError.message);
    }

    await document.destroy();

    logger.info(`Document deleted: ${id}`);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    logger.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocument,
  downloadDocument,
  updateDocument,
  deleteDocument
};
