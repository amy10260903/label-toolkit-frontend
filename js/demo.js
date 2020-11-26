import { uploadFile } from '/api/fingerprint.js';
import { getOptions } from '/api/option.js';

const results = {};

/**
 * GET options for select-list
 */
$( document ).ready(function() {
    getOptions()
        .then(function (response) {
            console.log(response);
            response.data.results.forEach((key => {
                let option = document.createElement("option");
                option.text = key;
                $('#select-location').append(option);
            }))
            $('select').niceSelect();
        })
        .catch(function (response) {
            console.log(response);
        });
});

/**
 * UPDATE filename of uploaded audio track
 */
$('#upload-btn').change(function() {
    $('#upload-label')[0].textContent = this.files[0].name;
});

$('#btn-play').click(function() {
   Spectrum.play();

   $('#btn-stop')[0].disabled = false;
   $('#btn-pause')[0].disabled = false;
   $('#btn-play')[0].disabled = true;
});

$('#btn-pause').click(function() {
   Spectrum.pause();

   $('#btn-pause')[0].disabled = true;
   $('#btn-play')[0].disabled = false;
});

$('#btn-stop').click(function() {
   Spectrum.stop();

   $('#btn-stop')[0].disabled = true;
   $('#btn-pause')[0].disabled = true;
   $('#btn-play')[0].disabled = false;
});

$('#slider').change(function() {
    Spectrum.zoom(Number(this.value));
});

Spectrum.on('ready', function() {
   $('#btn-play')[0].disabled = false;
});

/**
 * INIT loaders
 */
$('.loader-inner').loaders();

const Loader = {};
Loader.show = function () {
    $('#section-loader')[0].style.display = 'block';
}
Loader.hide = function() {
    $('#section-loader')[0].style.display = 'none';
    $('#selection-form')[0].style.display = 'none';
    $('#candidate')[0].style.display = 'block';
}

/**
 * POST analysis uploaded audio track
 */
function startAnalysis() {
    console.log('startAnalysis');
    const data = {
        category: $(".current")[0].innerHTML,
        file: $("#upload-btn").prop('files')[0],
    };
    Loader.show();
    uploadFile(data)
        .then(function (response) {
            console.log(response);
            Loader.hide();
            getDetail(response.data.results);
            updateSpectrum();
        })
        .catch(function (response) {
            console.log(response);
        });
}

/**
 * UPDATE list and show the results
 */
function getDetail(data) {
    data.forEach((object) => {
        let option = document.createElement("option");
        option.text = object.song_name;
        $('#select-soundsource').append(option);
        results[object.song_name] = object.offset_seconds;
    })
    $('select').niceSelect('update');
}

/**
 * UPDATE show corresponded spectrum of selected audio track
 */
function updateSpectrum() {
    const key = $('.current')[1].innerHTML;
    Spectrum.load(`/assets/dataset/TW_TPE/${key}.wav`);
    let currentTime = parseInt( results[key] );
    (currentTime < 0) && (currentTime = 0);

    let currentProgress = currentTime / Spectrum.getDuration();
    Spectrum.seekTo(currentProgress);
}

export {
    startAnalysis,
    updateSpectrum,
};