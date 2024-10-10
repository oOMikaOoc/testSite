// Fonction pour démarrer le scan de code-barres
document.getElementById('scanBtn').addEventListener('click', function() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#barcodeScannerArea'),
            constraints: {
                facingMode: "environment"  // Utiliser la caméra arrière pour une meilleure qualité de scan
            }
        },
        decoder: {
            readers: ["code_128_reader", "ean_reader", "code_39_reader"]
        },
        locate: true  // Activer la localisation automatique du code-barres
    }, function(err) {
        if (err) {
            console.log(err);
            return;
        }
        Quagga.start();
    });

    Quagga.onDetected(function(result) {
        let code = result.codeResult.code;
        document.getElementById('barcodeResult').innerText = "Code-barres scanné : " + code;
        searchCSV(code);  // Recherche dans le CSV après scan
        Quagga.stop();  // Arrêter le scan une fois le code-barres détecté
    });
});

// Fonction de recherche dans le CSV pour afficher les résultats formatés
function searchCSV(term) {
    if (!window.csvData) {
        document.getElementById('csvResult').innerText = "Veuillez d'abord sélectionner un fichier CSV.";
        return;
    }

    let result = "Aucun résultat trouvé pour : " + term;
    let found = false;
    let resultContent = "";

    for (let i = 1; i < window.csvData.length; i++) {
        let row = window.csvData[i];
        if (row.some(col => col.toString().toLowerCase().includes(term.toLowerCase()))) {
            found = true;
            resultContent = `
                <h3>Résultat trouvé :</h3>
                <p><strong>NOM :</strong> ${row[0]}</p>
                <p><strong>Numéro de série :</strong> ${row[10]}</p>
                <p><strong>Numéro d'inventaire :</strong> ${row[11]}</p>
                <p><strong>Adresse MAC :</strong> ${row[13]}</p>
            `;
            break;
        }
    }

    document.getElementById('csvResult').innerHTML = found ? resultContent : result;
}

// Gestionnaire de la saisie manuelle
document.getElementById('searchBtn').addEventListener('click', function() {
    const searchTerm = document.getElementById('manualBarcode').value;
    if (searchTerm) {
        searchCSV(searchTerm);
    } else {
        alert("Veuillez entrer un terme à rechercher.");
    }
});

// Fonction pour lire un fichier CSV sélectionné
document.getElementById('csvFileInput').addEventListener('change', function(event) {
    let file = event.target.files[0];
    if (file) {
        loadCSV(file);
    }
});

// Fonction pour charger le CSV
function loadCSV(file) {
    Papa.parse(file, {
        complete: function(results) {
            window.csvData = results.data;
        }
    });
}

// Charger un CSV par défaut au démarrage si aucun fichier n'est sélectionné
window.onload = function() {
    if (!window.csvData) {
        fetch('glpi.csv')
            .then(response => response.text())
            .then(csvText => {
                Papa.parse(csvText, {
                    complete: function(results) {
                        window.csvData = results.data;
                    }
                });
            });
    }
};
