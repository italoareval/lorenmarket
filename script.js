document.addEventListener('DOMContentLoaded', () => {
    const itemListContainer = document.getElementById('item-list');
    const classeSelect = document.getElementById('filter-classe');
    const tipoSelect = document.getElementById('filter-tipo');
    const nomeSelect = document.getElementById('filter-nome');
    const adicionaisSelect = document.getElementById('filter-adicionais');
    const nivelSelect = document.getElementById('filter-nivel');
    const popup = document.getElementById('price-popup');
    const canvas = document.getElementById('price-chart');
    const ctx = canvas.getContext('2d');
    let allItems = [];
    const formspreeUrl = "https://formspree.io/f/mdklrayw";

    const fetchItems = async () => {
        try {
            const response = await fetch('dados.json');
            if (!response.ok) {
                throw new Error('Não foi possível carregar o arquivo dados.json');
            }
            allItems = await response.json();
            populateFilters(allItems);
            displayItems(allItems);
        } catch (error) {
            console.error('Erro ao buscar os itens:', error);
            itemListContainer.innerHTML = '<p>Erro ao carregar os dados. Por favor, verifique se o arquivo dados.json está formatado corretamente.</p>';
        }
    };

    const populateSelect = (selectElement, itemsArray) => {
        const selectedValue = selectElement.value;
        const defaultOption = selectElement.querySelector('option[value=""]').cloneNode(true);
        selectElement.innerHTML = '';
        selectElement.appendChild(defaultOption);
        itemsArray.sort((a, b) => {
            if (a.startsWith('+') && b.startsWith('+')) {
                return parseInt(a.substring(1)) - parseInt(b.substring(1));
            }
            return a.localeCompare(b);
        }).forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            selectElement.appendChild(option);
        });
        selectElement.value = selectedValue;
    };

    const populateFilters = (items) => {
        const uniqueClasses = [...new Set(items.map(item => item.classe))];
        const uniqueTipos = [...new Set(items.map(item => item.tipo))];
        const uniqueNomes = [...new Set(items.map(item => item.nome))];
        const uniqueAdicionais = [...new Set(items.flatMap(item => item.adicionais))];
        const uniqueNiveis = [...new Set(items.flatMap(item => item.nivel))];
        populateSelect(classeSelect, uniqueClasses);
        populateSelect(tipoSelect, uniqueTipos);
        populateSelect(nomeSelect, uniqueNomes);
        populateSelect(adicionaisSelect, uniqueAdicionais);
        populateSelect(nivelSelect, uniqueNiveis);
    };

    const displayItems = (items) => {
        itemListContainer.innerHTML = '';
        if (items.length === 0) {
            itemListContainer.innerHTML = '<p>Nenhum item encontrado com os filtros selecionados.</p>';
            return;
        }

        items.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.classList.add('item-card');
            
            const adicionais = item.adicionais.length > 0 ? `<p><strong>Adicionais:</strong> ${item.adicionais.join(', ')}</p>` : '';
            const nivel = item.nivel.length > 0 ? `<p><strong>Nível:</strong> ${item.nivel.join(', ')}</p>` : '';

            itemCard.innerHTML = `
                <h3>${item.nome}</h3>
                <p><strong>Preço Médio:</strong> R$ ${item.precoMedio}</p>
                <p><strong>Classe:</strong> ${item.classe}</p>
                <p><strong>Tipo:</strong> ${item.tipo}</p>
                ${adicionais}
                ${nivel}
                <form action="${formspreeUrl}" method="POST" class="report-form">
                    <input type="hidden" name="Item" value="${item.nome}">
                    <textarea name="Mensagem" placeholder="Descreva o problema" required></textarea>
                    <button type="submit" class="report-button">Relatar Problema</button>
                </form>
            `;
            itemListContainer.appendChild(itemCard);

            const itemNameElement = itemCard.querySelector('h3');
            itemNameElement.addEventListener('mouseover', (e) => showPopup(e, item.historicoPreco));
            itemNameElement.addEventListener('mouseout', hidePopup);
        });
    };
    
    // Funções para o pop-up do gráfico
    const showPopup = (e, historico) => {
        if (!historico || historico.length < 2) {
            return; // Não mostra se não houver dados suficientes
        }
        
        // Posiciona o pop-up
        popup.style.display = 'block';
        const rect = e.target.getBoundingClientRect();
        popup.style.top = `${window.scrollY + rect.bottom + 5}px`;
        popup.style.left = `${window.scrollX + rect.left}px`;
        
        drawGraph(historico);
    };

    const hidePopup = () => {
        popup.style.display = 'none';
    };

    const drawGraph = (prices) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const padding = 10;
        const width = canvas.width - 2 * padding;
        const height = canvas.height - 2 * padding;
        
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        const priceRange = maxPrice - minPrice;
        
        ctx.beginPath();
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        
        // Desenha a linha do gráfico
        prices.forEach((price, index) => {
            const x = padding + (width / (prices.length - 1)) * index;
            const y = padding + height - (price - minPrice) / priceRange * height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Desenha os pontos
        ctx.fillStyle = '#e74c3c';
        prices.forEach((price, index) => {
            const x = padding + (width / (prices.length - 1)) * index;
            const y = padding + height - (price - minPrice) / priceRange * height;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    };

    const filterItems = () => {
        const selectedClasse = classeSelect.value;
        const selectedTipo = tipoSelect.value;
        const selectedNome = nomeSelect.value;
        const selectedAdicional = adicionaisSelect.value;
        const selectedNivel = nivelSelect.value;

        let filteredItems = allItems.filter(item => {
            const matchesClasse = selectedClasse === '' || item.classe === selectedClasse;
            const matchesTipo = selectedTipo === '' || item.tipo === selectedTipo;
            const matchesNome = selectedNome === '' || item.nome === selectedNome;
            const matchesAdicional = selectedAdicional === '' || item.adicionais.includes(selectedAdicional);
            const matchesNivel = selectedNivel === '' || item.nivel.includes(selectedNivel);
            return matchesClasse && matchesTipo && matchesNome && matchesAdicional && matchesNivel;
        });

        populateFilters(filteredItems);
        classeSelect.value = selectedClasse;
        tipoSelect.value = selectedTipo;
        nomeSelect.value = selectedNome;
        adicionaisSelect.value = selectedAdicional;
        nivelSelect.value = selectedNivel;
        displayItems(filteredItems);
    };

    classeSelect.addEventListener('change', filterItems);
    tipoSelect.addEventListener('change', filterItems);
    nomeSelect.addEventListener('change', filterItems);
    adicionaisSelect.addEventListener('change', filterItems);
    nivelSelect.addEventListener('change', filterItems);

    fetchItems();
});
