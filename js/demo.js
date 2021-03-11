import { uploadFile } from '/api/fingerprint.js';
import { getOptions } from '/api/option.js';
import { dragElement } from '/js/drag.js';

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
    Loader.hide();
    $.getJSON('/assets/dataset/json/test_results.json', function( json ) {
        // console.log(json);
        getDetail(json.results);
        updateSpectrum();
    });
    // uploadFile(data)
    //     .then(function (response) {
    //         console.log(response);
    //         Loader.hide();
    //         getDetail(response.data.results);
    //         updateSpectrum();
    //     })
    //     .catch(function (response) {
    //         console.log(response);
    //     });
}

/**
 * UPDATE list and show the results
 */
function getDetail(data) {
    data.forEach((object) => {
        // selection menu
        let option = document.createElement("option");
        option.text = object.song_name;
        $('#select-soundsource').append(option);

        // block for each segment
        let content = document.createElement("div");
        content.setAttribute("class", "content-segment");
        content.setAttribute("id", `content-segment-${object.song_name}`);
        $('.wrapper').append(content);

        results[object.song_name] = {
            'timestamp': object.timestamp_in_seconds,
            'is_plot': false,
        };
    });
    $('select').niceSelect('update');
}

// function test(key) {
//     let content = document.createElement("div");
//     content.setAttribute("class", "content-segment");
//     content.setAttribute("id", `content-segment-${key}`);
//     $('.wrapper').append(content);
//
//     let duration = 177.5;
//     results[key].timestamp.forEach((obj, idx) => {
//         let segment = document.createElement("div");
//         segment.setAttribute("class", "item");
//         segment.setAttribute("id", `segment-${idx}`);
//         segment.style.display = 'block';
//         segment.style.left = (obj.onset/duration)*80 + 'vw';
//         segment.style.width = ((obj.offset-obj.onset)/duration)*80 + 'vw';
//         content.append(segment);
//     });
// }

/**
 * UPDATE show corresponded spectrum of selected audio track
 */
function updateSpectrum() {
    const key = $('.current')[1].innerHTML;
    Spectrum.load(`/assets/dataset/TW_TPE/${key}.wav`);
    Spectrum.on('ready', function() {
        addSegments($('.current')[1].innerHTML);
    });
}

/**
 * ADD candidate segments for selected audio track
 */
function addSegments(key){
    console.log('addSegment')
    $('.content-segment').each(function() {
        if (this.id == `content-segment-${key}`) {
            this.style.display = "block";
        } else {
            this.style.display = "none";
        }
    })
    if (!results[key].is_plot) {
        const duration = Spectrum.getDuration();
        results[key].timestamp.forEach((obj,idx) => {
            if (obj.onset < duration) {
                let segment = document.createElement("div");
                segment.setAttribute("class", "item");
                segment.setAttribute("id", `segment-${idx}`);
                segment.style.display = 'block';
                segment.style.left = (obj.onset/duration)*80 + 'vw';
                if (obj.offset > duration) {
                    segment.style.width = ((duration-obj.onset)/duration)*80 + 'vw';
                } else {
                    segment.style.width = ((obj.offset-obj.onset)/duration)*80 + 'vw';
                }
                $(`#content-segment-${key}`).append(segment);

                segment.addEventListener('click', function() {
                   // console.log('click');
                    let currentProgress = obj.onset/duration;
                    Spectrum.seekTo(currentProgress);
                    this.classList.toggle("item-focus");
                    dragElement(this);
                });
            }
        });
        results[key].is_plot = true;
    }
}

export {
    startAnalysis,
    updateSpectrum,
};