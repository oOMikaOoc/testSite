// Fonction pour démarrer le scan de code-barres
document.getElementById('scanBtn').addEventListener('click', function() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#barcodeResult')    // l'élément HTML où on veut afficher le flux vidéo
        },
        decoder: {
            readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "code_39_vin_reader"]
        }
    }, function(err) {
        if (err) {
            console.log(err);
            return;
        }
        Quagga.start();
    });

    Quagga.onDetected(function(result) {
        let code = result.codeResult.code;
        document.getElementById('barcodeResult').innerText = "Code-barres: " + code;
        searchCSV(code);
    });
});

// Fonction pour lire le fichier CSV sélectionné
document.getElementById('csvFileInput').addEventListener('change', function(event) {
    let file = event.target.files[0];
    if (file) {
        Papa.parse(file, {
            complete: function(results) {
                console.log("Données CSV:", results.data);
                window.csvData = results.data;  // Stocker les données CSV dans une variable globale
            }
        });
    }
});

// Fonction pour rechercher dans le CSV avec le code-barres scanné
function searchCSV(barcode) {
    if (!window.csvData) {
        document.getElementById('csvResult').innerText = "Veuillez d'abord sélectionner un fichier CSV.";
        return;
    }

    let result = "Produit non trouvé";
    for (let i = 0; i < window.csvData.length; i++) {
        if (window.csvData[i][0] === barcode) {  // Imaginons que le code-barres soit dans la première colonne
            result = "Produit: " + window.csvData[i][1];  // On affiche la donnée de la deuxième colonne
            break;
        }
    }
    document.getElementById('csvResult').innerText = result;
}
