const tipoMaterialRepository = require('../repositories/TipoMaterialRepository');

class MaterialController {
  async listar(req, res) {
    try {
      const materiais = await tipoMaterialRepository.listarAtivos();

      res.json({
        sucesso: true,
        dados: materiais,
        mensagem: 'Tipos de material listados com sucesso'
      });

    } catch (error) {
      console.error('Erro ao listar materiais:', error);
      res.status(500).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }
}

module.exports = new MaterialController(); 