// Fonction pour démarrer le scan de code-barres
document.getElementById('scanBtn').addEventListener('click', function() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#barcodeResult')    // élément où le flux vidéo s'affiche
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
        document.getElementById('barcodeResult').innerText = "Code-barres scanné : " + code;
        searchCSV(code);
    });
});

// Fonction pour rechercher un terme dans le CSV et afficher les informations de manière formatée
function searchCSV(term) {
    if (!window.csvData) {
        document.getElementById('csvResult').innerText = "Veuillez d'abord sélectionner un fichier CSV.";
        return;
    }

    let result = "Aucun résultat trouvé pour : " + term;
    let found = false;
    let resultContent = "";

    // Recherche du terme dans le CSV
    for (let i = 1; i < window.csvData.length; i++) {  // Ignorer la première ligne d'en-tête
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

    // Afficher le résultat formaté
    document.getElementById('csvResult').innerHTML = found ? resultContent : result;
}

// Gestionnaire pour la saisie manuelle du terme à rechercher
document.getElementById('searchBtn').addEventListener('click', function() {
    const searchTerm = document.getElementById('manualBarcode').value;
    if (searchTerm) {
        searchCSV(searchTerm);
    } else {
        alert("Veuillez entrer un terme à rechercher.");
    }
});

// Fonction pour lire le fichier CSV sélectionné ou charger un fichier par défaut
document.getElementById('csvFileInput').addEventListener('change', function(event) {
    let file = event.target.files[0];
    if (file) {
        loadCSV(file);
    }
});

// Fonction pour charger un fichier CSV
function loadCSV(file) {
    Papa.parse(file, {
        complete: function(results) {
            console.log("Données CSV:", results.data);
            window.csvData = results.data;  // Stocker les données CSV dans une variable globale
        }
    });
}

// Charger un fichier CSV par défaut (glpi.csv) si aucun fichier n'est fourni
window.onload = function() {
    if (!window.csvData) {
        fetch('glpi.csv')
            .then(response => response.text())
            .then(csvText => {
                Papa.parse(csvText, {
                    complete: function(results) {
                        console.log("Données CSV par défaut chargées:", results.data);
                        window.csvData = results.data;
                    }
                });
            });
    }
};
