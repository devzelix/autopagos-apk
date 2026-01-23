const fs = require('fs');
const path = require('path');

const pluginsJsonPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'capacitor.plugins.json');

console.log('🔧 Verificando plugins personalizados en capacitor.plugins.json...');

try {
  const plugins = JSON.parse(fs.readFileSync(pluginsJsonPath, 'utf8'));

  // Plugins personalizados a agregar
  const customPlugins = [
    {
      pkg: "local",
      classpath: "com.fibextelecom.autopago.NetworkInfoPlugin"
    },
    {
      pkg: "local",
      classpath: "com.fibextelecom.autopago.PrinterPlugin"
    }
  ];

  let modified = false;

  // Verificar si ya existen y agregarlos si no
  customPlugins.forEach(customPlugin => {
    const exists = plugins.some(p => p.classpath === customPlugin.classpath);
    if (!exists) {
      plugins.push(customPlugin);
      console.log('✅ Agregado:', customPlugin.classpath);
      modified = true;
    } else {
      console.log('✓ Ya existe:', customPlugin.classpath);
    }
  });

  if (modified) {
    fs.writeFileSync(pluginsJsonPath, JSON.stringify(plugins, null, '\t'));
    console.log('✅ capacitor.plugins.json actualizado correctamente');
  } else {
    console.log('✓ Todos los plugins personalizados están presentes');
  }
} catch (error) {
  console.error('❌ Error al actualizar plugins:', error.message);
  process.exit(1);
}

