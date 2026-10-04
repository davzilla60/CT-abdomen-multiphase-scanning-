# Multiphase Abdomen & Pelvis CT · Rad-Lad

An embeddable teaching tool that shows how IV contrast moves through the abdomen and pelvis across the
**non-contrast**, **arterial**, **portal venous** and **delayed** CT phases.

- **Contrast journey diagram** (top left) animates contrast arriving in each structure, in the order it gets
  there, whenever a phase is chosen. *Start injection* plays the whole sequence.
- **CT preview** with scrollable axial stacks (mouse wheel, drag, slider, arrow keys, cine). Phases stay in
  sync by table position, and *Compare phases* scrolls all phases side by side.
- Phase card with typical timing and what each phase is best for; a *Learn* dialog summarises the protocol.
- Image source citations are shown in the footer.

It is a static site (HTML/CSS/JS, no build step, no dependencies), so it can be hosted anywhere,
e.g. GitHub Pages.

## Embedding

```html
<iframe src="https://<your-host>/index.html" title="Multiphase abdomen CT"
        style="width:100%; height:1500px; border:0" loading="lazy"></iframe>
```

Add `?phase=arterial` (or `non-contrast`, `portal-venous`, `delayed`) to open on a given phase.
The layout stacks to a single column below 1000 px wide.

## Images

`images/<phase>/NNN.jpg` are 512×512 axial slices (2.5 mm, soft-tissue window W400/L40) converted from the
TCIA series: non-contrast 74756, arterial 63735, portal venous 31168. The arterial series covers the liver
only, so lower levels show the nearest arterial slice with a note.

The delayed phase (series 52688, 127 slices at 3 mm, liver to pelvis) comes from a different patient in the
Medical Segmentation Decathlon. Its table positions are shifted by -203 mm so it lines up with the other
phases at the same body level, and the viewer labels it as a different patient.

### Regenerating or replacing a phase

```bash
pip install pydicom numpy pillow
python3 tools/convert_dicom.py /path/to/dicom-root delayed=52688@-203
```

This writes `images/<phase>/` and updates `js/series.js`; the viewer picks it up automatically.

## Sources

Non-contrast, arterial and portal venous images:
Moawad, A. W., Fuentes, D., Morshid, A., Khalaf, A. M., Elmohr, M. M., Abusaif, A., Hazle, J. D., Kaseb, A. O.,
Hassan, M., Mahvash, A., Szklaruk, J., Qayyom, A., & Elsayes, K. (2021). Multimodality annotated HCC cases with
and without advanced imaging segmentation [Data set]. The Cancer Imaging Archive.
https://doi.org/10.7937/TCIA.5FNA-0924

Delayed phase images:
Antonelli, M., Reinke, A., Bakas, S. et al. The Medical Segmentation Decathlon. Nat Commun 13, 4128 (2022).
https://doi.org/10.1038/s41467-022-30695-9

*Illustrative learning model. Timing varies by protocol and patient. Not for diagnostic use.*
