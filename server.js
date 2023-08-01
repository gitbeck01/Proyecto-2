const express = require("express");
const { connectToDB, disconnectFromMongoDB } = require("./src/mongodb");
const app = express();
const PORT = process.env.PORT || 3000;

// Configurar el middleware para analizar el cuerpo de las solicitudes como JSON
app.use(express.json());

// Middleware para establecer el encabezado Content-Type en las respuestas
app.use((req, res, next) => {
    res.header("Content-Type", "application/json; charset=utf-8");
    next()
});

// Ruta de inicio
app.get("/", (req, res) => {
    res.status(200).send("Bienvenido a la API de Electronicos")
});

// Ruta para obtener todos los productos
app.get("/electronicos", async (req, res) => {
    try {
        const client = await connectToDB();
        if (!client) {
            res.status(500).send("Error al conectarse a MongoDB");
            return;
        }
         // Obtener la colección de electronicos y convertir los documentos a un array
        const db = client.db("electronicos");
        const electronicos = await db.collection("electronicos").find().toArray();
        res.json(electronicos);
    } catch (error) {
        // Manejo de errores al obtener los productos
        res.status(500).send("Error al obtener los productos de la base de datos");
    } finally {
        // Desconexión de la base de datos
        await disconnectFromMongoDB();
    }
});
// Ruta para obtener un producto por su ID o codigo en este caso
app.get("/electronicos/codigo/:codigo", async (req, res) => {
    const electronicosId = parseInt(req.params.codigo);
    try {
        // Conexión a la base de datos
        const client = await connectToDB();
        if (!client) {
            res.status(500).send("Error al conectarse a MongoDB");
            return;
        }
        // Obtener la colección de electronicos y buscar el producto por su ID o Codigo
        const db = client.db("electronicos");
        const electronicos = await db.collection("electronicos").findOne({ codigo: electronicosId });
        if (electronicos) {
            res.json(electronicos);
        } else {
            res.status(404).send("Producto no encontrado");
        }
    } catch (error) {
        // Manejo de errores al obtener el producto
        res.status(500).send("Error al obtener el producto de la base de datos");
    } finally {
        // Desconexión de la base de datos
        await disconnectFromMongoDB();
    }
});

// Ruta para obtener un producto por su nombre
app.get("/electronicos/nombre/:nombre", async (req, res) => {
    try {
        const consultaNombre = req.params.nombre.trim().toLowerCase();
    
        const client = await connectToDB();
        if (!client) {
          return res.status(500).send("Error al conectarse a MongoDB");
        }
    
        const db = client.db("electronicos");
        const electronicos = await db
          .collection("electronicos").find({ nombre: { $regex: new RegExp(consultaNombre, "i")}}).toArray();
    
        if (electronicos.length > 0) {
          res.json(electronicos);
        } else {
          res.status(404).send("No se encontraron productos con el nombre solicidado");
        }
      } catch (error) {
        console.error("Error al obtener el nombre de la base de datos:", error);
        res.status(500).send("Error al obtener el nombre de la base de datos");
      } finally {
        await disconnectFromMongoDB();
      }
    });


// Ruta para obtener un producto por su importe
app.get("/electronicos/precio/:precio", async (req, res) => {
    const precioElectronicos = parseInt(req.params.precio);
        try {
         // Conexión a la base de datos    
        const client = await connectToDB();
        if (!client) {
            res.status(500).send("Error al conectarse a MongoDB");
            return;
        }
         // Obtener la colección de electronicos y buscar el producto por su precio
        const db = client.db("electronicos");
        const electronicos = await db.collection("electronicos").find({ precio: {$gte: precioElectronicos}}).toArray();
        if (electronicos.length > 0) {
            res.json(electronicos);
        } else {
            res.status(404).send("Producto no encontrado");
        }
    } catch (error) {
        res.status(500).send("Error al obtener el producto de la base de datos");
    } finally {
        await disconnectFromMongoDB();
    }
});

// Ruta para obtener productos por categoria
app.get("/electronicos/categoria/:categoria", async (req, res) => {
    try {
      const consultaCategoria = req.params.categoria.trim().toLowerCase();
  
      const client = await connectToDB();
      if (!client) {
        return res.status(500).send("Error al conectarse a MongoDB");
      }
  
      const db = client.db("electronicos");
      const electronicos = await db
        .collection("electronicos")
        .find({ categoria: { $regex: new RegExp(consultaCategoria, "i") } })
        .toArray();
  
      if (electronicos.length > 0) {
        res.json(electronicos);
      } else {
        res.status(404).send("No se encontraron productos en la categoría especificada");
      }
    } catch (error) {
      console.error("Error al obtener la categoria de la base de datos:", error);
      res.status(500).send("Error al obtener la categoria de la base de datos");
    } finally {
      await disconnectFromMongoDB();
    }
  });
  

// Ruta para agregar un nuevo recurso
app.post("/electronicos", async (req,res) => {
    const nuevoElectro = req.body;
    try {
        if (nuevoElectro === undefined) {
            res.status(400).send("Error en el formato de datos a crear");
        }

        const client = await connectToDB();
        if (!client) {
            res.status(500).send("Error al conectarse a MongoDB");
        }

        const db = client.db("electronicos");
        const collection = db.collection("electronicos");
        await collection.insertOne(nuevoElectro);
        console.log("Nuevo producto creado");
        res.status(201).send(nuevoElectro);

    } catch (error) {
        res.status(500).send("Error al intentar agregar un nuevo producto");
    } finally
{
    await disconnectFromMongoDB();
}    
});

//Ruta para modificar un recurso
app.put("/electronicos/codigo/:codigo", async (req, res) => {
    const codiElectronicos = parseInt(req.params.codigo);
    const nuevaData = req.body;
    try {
        if (!nuevaData) {
            res.status(400).send("Error en el formato de datos a crear");
        }

        const client = await connectToDB();
        if (!client) {
            res.status(500).send("Error al conectarse a MongoDB");
        }

        const db = client.db("electronicos");
        const collection = db.collection("electronicos");
        await collection.updateOne({ codigo: codiElectronicos }, { $set: nuevaData });
        console.log("Producto Modificado");
        req.status(200).send(nuevaData)

    } catch (error) {
        res.status(500).send("Error al modificar el producto");
    } finally {

        await disconnectFromMongoDB();
    }
});

// Ruta para eliminar un recurso
app.delete("/electronicos/codigo/:codigo", async (req, res) => {
    const codiElectronicos = parseInt(req.params.codigo);
    try {
        if (!codiElectronicos) {
            res.status(400).send("Error en el formato de datos a crear");
            return;
        }
        //Conexion a la base de datos
        const client = await connectToDB();
        if (!client) {
            res.status(500).send("Error al conectarse a MongoDB");
            return;
        }
// Obtener la colección de electronicos, buscar el producto por su ID y eliminarlo
        const db = client.db("electronicos");
        const collection = db.collection("electronicos");
        const resultado = await collection.deleteOne({ codigo: codiElectronicos });
        if (resultado.deletedCount === 0) {
            res.statusMessage(404).send("No se encontro el producto con id seleccionado");
        } else {
            console.log("Producto Eliminado");
            res.status(204).send();
        }
    }catch (error) {
        res.status(500).send("Error al modificar el producto");
    } finally {

        await disconnectFromMongoDB();
    }
});

// Ruta para modificar un recurso existente
app.patch("/electronicos/codigo/:codigo", async (req, res) => {
    const codiElectronicos = parseInt(req.params.codigo);
    const nuevaData = req.body;
    try {
        if (!nuevaData) {
            res.status(400).send("Error en el formato de datos a cear.");
        }

        const client = await connectToDB();
        if(!client) {
            res.status(500).send("Error al conectarse a MongoDB");
        }

        const db = client.db("electronicos");
        const collection = db.collection("electronicos");
        await collection.updateOne({ codigo: codiElectronicos }, { $set: nuevaData });
        console.log("Producto Modificado");
        res.status(200).send(nuevaData);
    }  catch (error) {
            res.status(500).send("Error al modificar el producto");
        } finally {
            await disconnectFromMongoDB();
        }    

});
// Ruta para modificar precio
app.patch("/electronicos/:codigo", async (req, res) => {
    const codiElectronicos = parseInt(req.params.codigo);
    const nuevaData = req.body;
    try {
        if (!nuevaData) {
            res.status(400).send("Error en el formato de datos a cear.");
        }

        const client = await connectToDB();
        if(!client) {
            res.status(500).send("Error al conectarse a MongoDB");
        }
// Conexion a la base de datos
        const db = client.db("electronicos");
        const collection = db.collection("electronicos");
        await collection.updateOne({ codigo: codiElectronicos }, { $set: { precio: req.body.precio } });
        console.log("Precio actualizado correctamente");
        res.status(200).send(nuevaData);
    }  catch (error) {
            res.status(500).send("Error al modificar el precio");
        } finally {
            await disconnectFromMongoDB();
        }    

});

// Ruta para manejar las solicitudes a rutas no existentes
app.get("*", (req, res) => {
    res.status(404).send("Lo sentimos, la página que buscas no existe.");
  });
  

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});