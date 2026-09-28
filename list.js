const exerciseList = document.getElementById("exercise-list");
const exerciseSearch = document.getElementById("exercise-search");

let exercises = [];

/* =========================================================
   PRESCRIPTION TYPE LABELS
   ========================================================= */

const prescriptionTypeLabels = {
    calorie: "Calorias",
    speed: "Velocidade",
    distance: "Distância",
    interval: "Intervalo",
    reps: "Repetições",
    time: "Tempo",
    watt: "Potência",
    revolution: "Rotações",
    stroke: "Remadas",
    weight: "Peso"
};

/* =========================================================
   RENDER
   ========================================================= */

function renderExercises(data) {
    exerciseList.innerHTML = "";

    if (data.length === 0) {
        const message = document.createElement("p");
        message.className = "list-message";
        message.textContent = "Nenhum exercício encontrado.";

        exerciseList.appendChild(message);
        return;
    }

    data.forEach(exercise => {
        const item = document.createElement("div");
        item.className = "list-item";

        if (exercise.active !== true) {
            item.classList.add("inactive");
        }

        /* -------------------------------------------------
           MAIN VALUE
           ------------------------------------------------- */

        const name = document.createElement("span");
        name.className = "list-item-main-value";
        name.textContent = exercise.name || "Sem nome";

        /* Prescription type */
        if (exercise.externalLoad) {

            name.textContent += " | " +
                prescriptionTypeLabels[exercise.externalLoad]
                || exercise.externalLoad;

        }

        item.appendChild(name);


        /* -------------------------------------------------
           ACTIONS
           ------------------------------------------------- */

        const actions = document.createElement("div");
        actions.className = "list-item-actions";


        /* Video */
        if (exercise.url) {
            const playButton = document.createElement("button");
            playButton.type = "button";
            playButton.className = "list-item-action";
            playButton.dataset.action = "play";
            playButton.dataset.id = exercise.documentId;
            playButton.title = "Assistir vídeo";
            playButton.setAttribute(
                "aria-label",
                `Assistir vídeo de ${exercise.name || "exercício"}`
            );

            const playImage = document.createElement("img");
            playImage.src =
                "https://personalcross.github.io/assets/store/play.png";
            playImage.alt = "Assistir vídeo";

            playButton.appendChild(playImage);
            actions.appendChild(playButton);
        }


        /* View */
        const viewButton = document.createElement("button");
        viewButton.type = "button";
        viewButton.className = "list-item-action";
        viewButton.dataset.action = "view";
        viewButton.dataset.id = exercise.documentId;
        viewButton.title = "Visualizar";
        viewButton.setAttribute(
            "aria-label",
            `Visualizar ${exercise.name || "exercício"}`
        );

        const viewImage = document.createElement("img");
        viewImage.src =
            "https://personalcross.github.io/assets/store/eye.png";
        viewImage.alt = "Ver";

        viewButton.appendChild(viewImage);
        actions.appendChild(viewButton);


        /* Edit */
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "list-item-action";
        editButton.dataset.action = "edit";
        editButton.dataset.id = exercise.documentId;
        editButton.title = "Editar";
        editButton.setAttribute(
            "aria-label",
            `Editar ${exercise.name || "exercício"}`
        );

        const editImage = document.createElement("img");
        editImage.src =
            "https://personalcross.github.io/assets/store/pencil.png";
        editImage.alt = "Editar";

        editButton.appendChild(editImage);
        actions.appendChild(editButton);


        /* Delete */
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className =
            "list-item-action list-action-delete";

        deleteButton.dataset.action = "delete";
        deleteButton.dataset.id = exercise.documentId;
        deleteButton.title = "Eliminar";
        deleteButton.setAttribute(
            "aria-label",
            `Eliminar ${exercise.name || "exercício"}`
        );

        const deleteImage = document.createElement("img");
        deleteImage.src =
            "https://personalcross.github.io/assets/store/trash.png";
        deleteImage.alt = "Eliminar";

        deleteButton.appendChild(deleteImage);
        actions.appendChild(deleteButton);


        item.appendChild(actions);
        exerciseList.appendChild(item);
    });
}

/* =========================================================
   LOAD
   ========================================================= */

async function loadExercises() {
    exerciseList.innerHTML = `
        <p class="list-message">
            A carregar exercícios...
        </p>
    `;

    try {
        const snapshot = await db.collection("exercises").get();

        exercises = snapshot.docs.map(doc => ({
            documentId: doc.id,
            ...doc.data()
        }));

        exercises.sort((a, b) => {
            
            // actives first
            const activeA = a.active === true ? 0 : 1;
            const activeB = b.active === true ? 0 : 1;

            if (activeA !== activeB) {
                return activeA - activeB;
            }

            // alfa order inside groups
            return (a.name || "").localeCompare(
                b.name || "",
                "pt-BR",
                {
                    sensitivity: "base"
                }
            );

        });

        renderExercises(exercises);

    } catch (error) {
        console.error(
            "Erro ao carregar exercícios:",
            error
        );

        exerciseList.innerHTML = `
            <p class="list-message">
                Não foi possível carregar os exercícios.
            </p>
        `;
    }
}

/* =========================================================
   SEARCH
   ========================================================= */

exerciseSearch.addEventListener("input", event => {
    const search = event.target.value
        .trim()
        .toLocaleLowerCase("pt-PT");

    if (!search) {
        renderExercises(exercises);
        return;
    }

    const filtered = exercises.filter(exercise =>
        (exercise.name || "")
            .toLocaleLowerCase("pt-PT")
            .includes(search)
    );

    renderExercises(filtered);
});

/* =========================================================
   VIDEO
   ========================================================= */

function openExerciseVideo(exercise) {
    if (!exercise.url) {
        M.toast({
            html: "Este exercício não possui vídeo."
        });

        return;
    }

    window.open(
        exercise.url,
        "_blank",
        "noopener,noreferrer"
    );
}

/* =========================================================
   DELETE
   ========================================================= */

async function deleteExercise(exercise) {
    if (!exercise || !exercise.documentId) {
        return;
    }

    const exerciseName = exercise.name || "este exercício";

    const confirmed = window.confirm(
        `Tem certeza de que deseja eliminar "${exerciseName}"?\n\n` +
        "Esta ação não pode ser desfeita."
    );

    if (!confirmed) {
        return;
    }

    try {
        await db.collection("exercises")
            .doc(exercise.documentId)
            .delete();

        M.toast({
            html: "Exercício eliminado com sucesso."
        });

        await loadExercises();

    } catch (error) {
        console.error(
            "Erro ao eliminar exercício:",
            error
        );

        M.toast({
            html: "Não foi possível eliminar o exercício."
        });
    }
}

/* =========================================================
   ACTION HANDLER
   ========================================================= */

exerciseList.addEventListener("click", async event => {
    const button = event.target.closest(
        "[data-action]"
    );

    if (!button) {
        return;
    }

    const action = button.dataset.action;
    const documentId = button.dataset.id;

    if (!documentId) {
        return;
    }

    const exercise = exercises.find(
        item => item.documentId === documentId
    );

    if (!exercise) {
        return;
    }


    /* -----------------------------------------------------
       PLAY
       ----------------------------------------------------- */

    if (action === "play") {
        openExerciseVideo(exercise);
        return;
    }


    /* -----------------------------------------------------
       VIEW
       ----------------------------------------------------- */

    if (action === "view") {
        openExerciseById(
            documentId,
            "view"
        );

        return;
    }


    /* -----------------------------------------------------
       EDIT
       ----------------------------------------------------- */

    if (action === "edit") {
        openExerciseById(
            documentId,
            "edit"
        );

        return;
    }


    /* -----------------------------------------------------
       DELETE
       ----------------------------------------------------- */

    if (action === "delete") {
        await deleteExercise(exercise);
    }
});

/* =========================================================
   INITIAL LOAD
   ========================================================= */

loadExercises();