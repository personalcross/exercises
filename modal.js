const exerciseModal = document.getElementById("exercise-modal");
const exerciseModalTitle = document.getElementById("exercise-modal-title");
const exerciseForm = document.getElementById("exercise-form");

const exerciseDocumentId = document.getElementById("exercise-document-id");
const exerciseName = document.getElementById("exercise-name");
const exerciseType = document.getElementById("exercise-type");
const exerciseComplexity = document.getElementById("exercise-complexity");
const exerciseExternalLoad = document.getElementById("exercise-external-load");

const exerciseAgonist = document.getElementById("exercise-agonist");
const exerciseSynergist = document.getElementById("exercise-synergist");
const exerciseAntagonist = document.getElementById("exercise-antagonist");
const exerciseEquipment = document.getElementById("exercise-equipment");

const exerciseUrl = document.getElementById("exercise-url");
const exerciseNotes = document.getElementById("exercise-notes");
const exerciseIsActive = document.getElementById("exercise-is-active");
const exerciseIsMultijoint = document.getElementById("exercise-is-multijoint")

const btnAddExercise = document.getElementById("btn-add-exercise");
const btnCancelExercise = document.getElementById("btn-cancel-exercise");
const btnSaveExercise = document.getElementById("btn-save-exercise");
const btnCloseExercise = document.getElementById("btn-close-exercise");

let exerciseModalMode = "add";

/* =========================================================
   MODAL STATE
   ========================================================= */

function setExerciseModalMode(mode) {
    exerciseModalMode = mode;

    const isView = mode === "view";
    const isEdit = mode === "edit";
    const isAdd = mode === "add";

    exerciseModalTitle.textContent =
        isAdd ? "Adicionar exercício" :
        isEdit ? "Editar exercício" :
        "Visualizar exercício";

    // Fields
    exerciseName.disabled = isView;
    exerciseType.disabled = isView;
    exerciseComplexity.disabled = isView;
    exerciseExternalLoad.disabled = isView;

    exerciseAgonist.disabled = isView;
    exerciseSynergist.disabled = isView;
    exerciseAntagonist.disabled = isView;
    exerciseEquipment.disabled = isView;

    exerciseUrl.disabled = isView;
    exerciseNotes.disabled = isView;
    exerciseIsActive.disabled = isView;
    exerciseIsMultijoint.disabled = isView;

    // Buttons
    btnSaveExercise.style.display = isView ? "none" : "";
    btnCancelExercise.style.display = isView ? "none" : "";
    btnCloseExercise.style.display = isView ? "" : "none";

    refreshMaterializeSelects();
}

/* =========================================================
   OPEN / CLOSE
   ========================================================= */

function openExerciseModal(mode = "add", exercise = null) {
    resetExerciseForm();

    setExerciseModalMode(mode);

    if (exercise) {
        fillExerciseForm(exercise);
    }

    const instance = M.Modal.getInstance(exerciseModal);

    if (instance) {
        instance.open();
    }
}

function closeExerciseModal() {
    const instance = M.Modal.getInstance(exerciseModal);

    if (instance) {
        instance.close();
    }
}

/* =========================================================
   RESET
   ========================================================= */

function resetExerciseForm() {
    exerciseForm.reset();

    exerciseDocumentId.value = "";

    clearMultiSelect(exerciseAgonist);
    clearMultiSelect(exerciseSynergist);
    clearMultiSelect(exerciseAntagonist);
    clearMultiSelect(exerciseEquipment);

    refreshMaterializeSelects();

    // Materialize labels
    M.updateTextFields();

    exerciseUrl.value = "";
    exerciseNotes.value = "";
    exerciseIsActive.value = true;
    exerciseIsMultijoint.value = true;
}

/* =========================================================
   FILL FORM
   ========================================================= */

function fillExerciseForm(exercise) {
    exerciseDocumentId.value = exercise.documentId || "";

    exerciseName.value = exercise.name || "";
    exerciseType.value = exercise.exerciseType || "";
    exerciseComplexity.value = exercise.complexityType || "";
    exerciseExternalLoad.value = exercise.externalLoad || "";

    setMultiSelectValues(
        exerciseAgonist,
        exercise.agonistMuscleGroup || []
    );

    setMultiSelectValues(
        exerciseSynergist,
        exercise.synergistMuscleGroup || []
    );

    setMultiSelectValues(
        exerciseAntagonist,
        exercise.antagonistMuscleGroup || []
    );

    setMultiSelectValues(
        exerciseEquipment,
        exercise.equipaments || []
    );

    exerciseUrl.value = exercise.url || "";
    exerciseNotes.value = exercise.notes || "";
    exerciseIsActive.value = exercise.isActive || true;
    exerciseIsMultijoint.value = exercise.isMultijoint || true;

    refreshMaterializeSelects();
    M.updateTextFields();
}

/* =========================================================
   MULTI SELECT HELPERS
   ========================================================= */

function setMultiSelectValues(select, values) {
    const normalizedValues = Array.isArray(values) ? values : [];

    Array.from(select.options).forEach(option => {
        option.selected = normalizedValues.includes(option.value);
    });
}


function clearMultiSelect(select) {
    Array.from(select.options).forEach(option => {
        option.selected = false;
    });
}


function getMultiSelectValues(select) {
    return Array.from(select.selectedOptions)
        .map(option => option.value);
}


function refreshMaterializeSelects() {
    const selects = document.querySelectorAll(
        "#exercise-modal select"
    );

    selects.forEach(select => {
        const instance = M.FormSelect.getInstance(select);

        if (instance) {
            instance.destroy();
        }

        M.FormSelect.init(select);
    });
}

/* =========================================================
   READ FORM
   ========================================================= */

function getExerciseFormData() {
    return {
        name: exerciseName.value.trim(),
        complexityType: exerciseComplexity.value,
        exerciseType: exerciseType.value,
        externalLoad: exerciseExternalLoad.value,
        agonistMuscleGroup: getMultiSelectValues(
            exerciseAgonist
        ),
        antagonistMuscleGroup: getMultiSelectValues(
            exerciseAntagonist
        ),
        synergistMuscleGroup: getMultiSelectValues(
            exerciseSynergist
        ),
        equipaments: getMultiSelectValues(
            exerciseEquipment
        ),
        notes: exerciseNotes.value.trim(),
        url: exerciseUrl.value.trim(),
        isActive: exerciseIsActive.value,
        isMultijoint: exerciseIsMultijoint.value
    };
}

/* =========================================================
   VALIDATION
   ========================================================= */

function validateExercise(data) {
    if (!data.name) {
        M.toast({
            html: "Informe o nome do exercício."
        });

        exerciseName.focus();
        return false;
    }

    if (!data.exerciseType) {
        M.toast({
            html: "Selecione o tipo de exercício."
        });

        return false;
    }

    if (!data.complexityType) {
        M.toast({
            html: "Selecione a complexidade."
        });

        return false;
    }

    if (!data.externalLoad) {
        M.toast({
            html: "Selecione o tipo de carga."
        });

        return false;
    }

    return true;
}

/* =========================================================
   SAVE
   ========================================================= */

async function saveExercise() {
    const data = getExerciseFormData();

    if (!validateExercise(data)) {
        return;
    }

    btnSaveExercise.disabled = true;

    try {
        if (exerciseModalMode === "add") {
            await db.collection("exercises").add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            M.toast({
                html: "Exercício adicionado com sucesso."
            });

        } else if (exerciseModalMode === "edit") {
            const documentId = exerciseDocumentId.value;

            if (!documentId) {
                throw new Error(
                    "Não foi possível identificar o exercício."
                );
            }

            await db.collection("exercises")
                .doc(documentId)
                .update({
                    ...data,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            M.toast({
                html: "Exercício atualizado com sucesso."
            });
        }

        closeExerciseModal();

        // Reload list
        if (typeof loadExercises === "function") {
            await loadExercises();
        }

    } catch (error) {
        console.error("Erro ao salvar exercício:", error);

        M.toast({
            html: "Não foi possível salvar o exercício."
        });

    } finally {
        btnSaveExercise.disabled = false;
    }
}

/* =========================================================
   OPEN EXISTING EXERCISE
   ========================================================= */

async function openExerciseById(documentId, mode) {
    if (!documentId) {
        return;
    }

    try {
        const document = await db.collection("exercises")
            .doc(documentId)
            .get();

        if (!document.exists) {
            M.toast({
                html: "Exercício não encontrado."
            });

            return;
        }

        const exercise = {
            documentId: document.id,
            ...document.data()
        };

        openExerciseModal(mode, exercise);

    } catch (error) {
        console.error(
            "Erro ao carregar exercício:",
            error
        );

        M.toast({
            html: "Não foi possível carregar o exercício."
        });
    }
}

/* =========================================================
   BUTTON EVENTS
   ========================================================= */

btnAddExercise.addEventListener("click", () => {
    openExerciseModal("add");
});


btnCancelExercise.addEventListener("click", () => {
    closeExerciseModal();
});


btnCloseExercise.addEventListener("click", () => {
    closeExerciseModal();
});


exerciseForm.addEventListener("submit", event => {
    event.preventDefault();

    if (exerciseModalMode === "view") {
        return;
    }

    saveExercise();
});

/* =========================================================
   INITIALIZE MATERIALIZE MODAL
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    M.Modal.init(exerciseModal, {
        dismissible: true,
        onCloseEnd: () => {
            resetExerciseForm();
        }
    });

    refreshMaterializeSelects();
});