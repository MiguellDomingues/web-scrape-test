const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new mongoose.Schema({
    source:     String,
    source_id:  String,
    source_url: String,
    name:       String,
    img_src:    String,
    price:      String,
    brand:      String,
    category:   String    
});

module.exports = {
    Product: mongoose.models.Product || mongoose.model('Product', productSchema),
  }

