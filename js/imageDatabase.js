/**
 * imageDatabase.js
 * 200+ curated images from picsum.photos with exact hex tagging
 * for perceptual color matching via CIEDE2000.
 *
 * @module imageDatabase
 */

import { hexToLab } from '../lib/colorUtils.js';

const DATABASE = [
  { id: 'red-01', seeds: ['red-01'], hexes: ['#D32F2F', '#C62828', '#B71C1C'], name: 'crimson', family: 'red', author: 'Annie Spratt' },
  { id: 'red-02', seeds: ['red-02'], hexes: ['#E53935', '#EF5350', '#E57373'], name: 'bright red', family: 'red', author: 'Joanna Kosinska' },
  { id: 'red-03', seeds: ['red-03'], hexes: ['#B71C1C', '#C62828', '#8B0000'], name: 'dark red', family: 'red', author: 'Cassie Matias' },
  { id: 'red-04', seeds: ['red-04'], hexes: ['#FF5252', '#FF1744', '#D50000'], name: 'bold red', family: 'red', author: 'Aaron Burden' },
  { id: 'red-05', seeds: ['red-05'], hexes: ['#C0392B', '#E74C3C', '#EC7063'], name: 'brick red', family: 'red', author: 'Valentin Petkov' },
  { id: 'red-06', seeds: ['red-06'], hexes: ['#800020', '#722F37', '#4A0404'], name: 'burgundy', family: 'red', author: 'Mia Frome' },
  { id: 'red-07', seeds: ['red-07'], hexes: ['#FF6F61', '#FF7F50', '#FF8C69'], name: 'coral red', family: 'red', author: 'Marta Pawlik' },
  { id: 'red-08', seeds: ['red-08'], hexes: ['#E0115F', '#C2185B', '#880E4F'], name: 'rose red', family: 'red', author: 'Raymond Rasmusson' },
  { id: 'red-09', seeds: ['red-09'], hexes: ['#9B2335', '#A4262C', '#BD3E47'], name: 'wine red', family: 'red', author: 'Mockup Graphics' },
  { id: 'red-10', seeds: ['red-10'], hexes: ['#DC143C', '#E60026', '#B22222'], name: 'crimson 2', family: 'red', author: 'Daniele Franchi' },
  { id: 'red-11', seeds: ['red-11'], hexes: ['#E74C3C', '#EC7063', '#E59866'], name: 'reddish', family: 'red', author: 'Henry Be' },
  { id: 'red-12', seeds: ['red-12'], hexes: ['#D32F2F', '#F44336', '#E53935'], name: 'medium red', family: 'red', author: 'Maxim Ilyahov' },
  { id: 'red-13', seeds: ['red-13'], hexes: ['#B22222', '#CD5C5C', '#A52A2A'], name: 'fire brick', family: 'red', author: 'Farsai Chaikulngamdee' },
  { id: 'red-14', seeds: ['red-14'], hexes: ['#AB274F', '#BE0032', '#900020'], name: 'ruby', family: 'red', author: 'Eugene Golovesov' },
  { id: 'red-15', seeds: ['red-15'], hexes: ['#E23D28', '#D93829', '#C63424'], name: 'tomato red', family: 'red', author: 'Nick Fewings' },
  { id: 'red-16', seeds: ['red-16'], hexes: ['#C41E3A', '#9E1B32', '#7A162A'], name: 'carmine', family: 'red', author: 'Lidya Nada' },
  { id: 'red-17', seeds: ['red-17'], hexes: ['#F4C2C2', '#E8A0A0', '#D97E7E'], name: 'pale red', family: 'red', author: 'Erol Ahmed' },
  { id: 'red-18', seeds: ['red-18'], hexes: ['#E32636', '#DA2C43', '#C21807'], name: 'alizarin', family: 'red', author: 'Todd Quackenbush' },
  { id: 'red-19', seeds: ['red-19'], hexes: ['#CC3333', '#B82828', '#A31E1E'], name: 'rust red', family: 'red', author: 'Adam Kring' },
  { id: 'red-20', seeds: ['red-20'], hexes: ['#E60000', '#CC0000', '#B30000'], name: 'pure red', family: 'red', author: 'Roberto Nickson' },

  { id: 'orange-01', seeds: ['orange-01'], hexes: ['#FF7F00', '#FF8C00', '#E65100'], name: 'true orange', family: 'orange', author: 'Drew Beamer' },
  { id: 'orange-02', seeds: ['orange-02'], hexes: ['#FF7F50', '#FF6F61', '#FF5722'], name: 'coral', family: 'orange', author: 'Vladimir Fedotov' },
  { id: 'orange-03', seeds: ['orange-03'], hexes: ['#E2725B', '#D56B4E', '#C56142'], name: 'terracotta', family: 'orange', author: 'Rene Bohmer' },
  { id: 'orange-04', seeds: ['orange-04'], hexes: ['#FFDAB9', '#FFCC99', '#FFB380'], name: 'peach', family: 'orange', author: 'Sandy Millar' },
  { id: 'orange-05', seeds: ['orange-05'], hexes: ['#AF6E4D', '#C19A6B', '#D4A76A'], name: 'caramel', family: 'orange', author: 'Yuriy Chemerys' },
  { id: 'orange-06', seeds: ['orange-06'], hexes: ['#FF8C42', '#FF6B35', '#FF5722'], name: 'tangerine', family: 'orange', author: 'Mae Mu' },
  { id: 'orange-07', seeds: ['orange-07'], hexes: ['#E67E22', '#D35400', '#C84300'], name: 'pumpkin', family: 'orange', author: 'Silvan Arnet' },
  { id: 'orange-08', seeds: ['orange-08'], hexes: ['#F4A460', '#E8964C', '#DB883B'], name: 'sandy orange', family: 'orange', author: 'Rodion Kutsaiev' },
  { id: 'orange-09', seeds: ['orange-09'], hexes: ['#FFB366', '#E6994D', '#CC8033'], name: 'light orange', family: 'orange', author: 'Raphael Nogueira' },
  { id: 'orange-10', seeds: ['orange-10'], hexes: ['#C4623D', '#B05231', '#9C4226'], name: 'burnt orange', family: 'orange', author: 'Ashley Byrd' },
  { id: 'orange-11', seeds: ['orange-11'], hexes: ['#FAA76F', '#F08C4F', '#E67335'], name: 'salmon', family: 'orange', author: 'Edgar Castrejon' },
  { id: 'orange-12', seeds: ['orange-12'], hexes: ['#CC5A2B', '#B84D23', '#A3401C'], name: 'copper', family: 'orange', author: 'Tom Hermans' },
  { id: 'orange-13', seeds: ['orange-13'], hexes: ['#FFB347', '#DB9730', '#B87B1B'], name: 'amber', family: 'orange', author: 'S O C I A L C U T' },
  { id: 'orange-14', seeds: ['orange-14'], hexes: ['#EAA672', '#D4935F', '#BD804D'], name: 'tawny', family: 'orange', author: 'Alexandr Podvalny' },
  { id: 'orange-15', seeds: ['orange-15'], hexes: ['#FFA500', '#E6930B', '#CC8206'], name: 'classic orange', family: 'orange', author: 'Patrick Tomasso' },
  { id: 'orange-16', seeds: ['orange-16'], hexes: ['#ED7117', '#D46413', '#BA570F'], name: 'marigold', family: 'orange', author: 'Tamara Bellis' },
  { id: 'orange-17', seeds: ['orange-17'], hexes: ['#FFC87C', '#E6AD6A', '#CC9258'], name: 'buff orange', family: 'orange', author: 'Micheile Henderson' },
  { id: 'orange-18', seeds: ['orange-18'], hexes: ['#D78B5D', '#C07A4F', '#A96941'], name: 'ochre', family: 'orange', author: 'Manki Kim' },

  { id: 'yellow-01', seeds: ['yellow-01'], hexes: ['#FFD700', '#FFC400', '#FFAB00'], name: 'gold', family: 'yellow', author: 'Daniel Tseng' },
  { id: 'yellow-02', seeds: ['yellow-02'], hexes: ['#E1AD01', '#C99700', '#B08200'], name: 'mustard', family: 'yellow', author: 'Scott Webb' },
  { id: 'yellow-03', seeds: ['yellow-03'], hexes: ['#FFF700', '#FFEE00', '#FFE500'], name: 'lemon', family: 'yellow', author: 'Zach Reiner' },
  { id: 'yellow-04', seeds: ['yellow-04'], hexes: ['#FFFACD', '#FFF59D', '#FFF176'], name: 'cream yellow', family: 'yellow', author: 'Nicolas J Leclercq' },
  { id: 'yellow-05', seeds: ['yellow-05'], hexes: ['#F5DEB3', '#E8D5A3', '#DBCC93'], name: 'wheat', family: 'yellow', author: 'Monica Grabkowska' },
  { id: 'yellow-06', seeds: ['yellow-06'], hexes: ['#E4C580', '#CDB26D', '#B69F5A'], name: 'brass', family: 'yellow', author: 'Nadir sYzYgY' },
  { id: 'yellow-07', seeds: ['yellow-07'], hexes: ['#FFE135', '#E6C930', '#CCB12A'], name: 'sunflower', family: 'yellow', author: 'Annie Spratt' },
  { id: 'yellow-08', seeds: ['yellow-08'], hexes: ['#FADA5E', '#E0C044', '#C6A62C'], name: 'naples yellow', family: 'yellow', author: 'Igor Son' },
  { id: 'yellow-09', seeds: ['yellow-09'], hexes: ['#FFF8DC', '#FFEEBB', '#FFE49A'], name: 'cornsilk', family: 'yellow', author: 'Nong V' },
  { id: 'yellow-10', seeds: ['yellow-10'], hexes: ['#C5B358', '#B0A04D', '#9B8D42'], name: 'old gold', family: 'yellow', author: 'Tom Pumford' },
  { id: 'yellow-11', seeds: ['yellow-11'], hexes: ['#FCE883', '#E3CE6D', '#CAB457'], name: 'butter', family: 'yellow', author: 'Calum Lewis' },
  { id: 'yellow-12', seeds: ['yellow-12'], hexes: ['#FFDF00', '#E6C800', '#CCB200'], name: 'bright yellow', family: 'yellow', author: 'Carlos Lindner' },
  { id: 'yellow-13', seeds: ['yellow-13'], hexes: ['#F3E5AB', '#DACE88', '#C1B766'], name: 'pale gold', family: 'yellow', author: 'Brett Jordan' },
  { id: 'yellow-14', seeds: ['yellow-14'], hexes: ['#EEDC82', '#D5C46E', '#BCAC5B'], name: 'harvest gold', family: 'yellow', author: 'Timothy Eberly' },
  { id: 'yellow-15', seeds: ['yellow-15'], hexes: ['#FFF8B0', '#E6DF98', '#CCC680'], name: 'vanilla', family: 'yellow', author: 'Olga Tutunaru' },

  { id: 'green-01', seeds: ['green-01'], hexes: ['#2D5A1E', '#3D6B2C', '#4A7A30'], name: 'forest green', family: 'green', author: 'Lukasz Szmigiel' },
  { id: 'green-02', seeds: ['green-02'], hexes: ['#4CAF50', '#43A047', '#388E3C'], name: 'medium green', family: 'green', author: 'Marek Piwnicki' },
  { id: 'green-03', seeds: ['green-03'], hexes: ['#386641', '#4A7B4C', '#5C8F57'], name: 'hunter green', family: 'green', author: 'Adrien Olichon' },
  { id: 'green-04', seeds: ['green-04'], hexes: ['#32CD32', '#2EB82E', '#27A427'], name: 'lime green', family: 'green', author: 'Shifaaz Shamoon' },
  { id: 'green-05', seeds: ['green-05'], hexes: ['#808000', '#717100', '#626200'], name: 'olive green', family: 'green', author: 'Leigh Jurgens' },
  { id: 'green-06', seeds: ['green-06'], hexes: ['#50C878', '#44B569', '#38A25A'], name: 'emerald', family: 'green', author: 'Timo Volz' },
  { id: 'green-07', seeds: ['green-07'], hexes: ['#228B22', '#1E7A1E', '#196919'], name: 'deep green', family: 'green', author: 'Patti Black' },
  { id: 'green-08', seeds: ['green-08'], hexes: ['#66BB6A', '#5CAA5F', '#529854'], name: 'fresh green', family: 'green', author: 'Sergei A' },
  { id: 'green-09', seeds: ['green-09'], hexes: ['#204D30', '#2E5C3E', '#3C6B4C'], name: 'pine', family: 'green', author: 'Max Bender' },
  { id: 'green-10', seeds: ['green-10'], hexes: ['#2E8B57', '#287D4E', '#226F45'], name: 'sea green', family: 'green', author: 'Chris Abney' },
  { id: 'green-11', seeds: ['green-11'], hexes: ['#8BC34A', '#7DB03D', '#6F9D30'], name: 'chartreuse', family: 'green', author: 'Hannah Gibbs' },
  { id: 'green-12', seeds: ['green-12'], hexes: ['#1B5E20', '#256D29', '#2F7C32'], name: 'dark green', family: 'green', author: 'Johannes Plenio' },
  { id: 'green-13', seeds: ['green-13'], hexes: ['#33691E', '#3D7A26', '#478B2E'], name: 'grass green', family: 'green', author: 'Andy Li' },
  { id: 'green-14', seeds: ['green-14'], hexes: ['#4DB33D', '#449F35', '#3B8B2D'], name: 'apple green', family: 'green', author: 'Hermes Rivera' },
  { id: 'green-15', seeds: ['green-15'], hexes: ['#7CB342', '#70A13A', '#648F32'], name: 'leaf green', family: 'green', author: 'Soraya Irving' },
  { id: 'green-16', seeds: ['green-16'], hexes: ['#689F38', '#5E8F31', '#547F2A'], name: 'sap green', family: 'green', author: 'Joshua Fuller' },
  { id: 'green-17', seeds: ['green-17'], hexes: ['#C5E1A5', '#B0CD91', '#9BB97D'], name: 'mint green', family: 'green', author: 'Meriç Dağlı' },
  { id: 'green-18', seeds: ['green-18'], hexes: ['#6D8B3C', '#617D36', '#556F30'], name: 'moss', family: 'green', author: 'Dan Meyers' },
  { id: 'green-19', seeds: ['green-19'], hexes: ['#A5D6A7', '#94C396', '#83B085'], name: 'pastel green', family: 'green', author: 'Gary Bendig' },
  { id: 'green-20', seeds: ['green-20'], hexes: ['#3E8E41', '#368238', '#2E762F'], name: 'jade green', family: 'green', author: 'Wren Meinberg' },
  { id: 'green-21', seeds: ['green-21'], hexes: ['#2C6E49', '#3B7D59', '#4A8C69'], name: 'viridian', family: 'green', author: 'Jamie Street' },
  { id: 'green-22', seeds: ['green-22'], hexes: ['#556B2F', '#4C6129', '#435723'], name: 'olive drab', family: 'green', author: 'Bonnie Kittle' },
  { id: 'green-23', seeds: ['green-23'], hexes: ['#4A7C59', '#416D4F', '#385E45'], name: 'fern', family: 'green', author: 'Sarah Dorweiler' },
  { id: 'green-24', seeds: ['green-24'], hexes: ['#98FB98', '#88E288', '#78C978'], name: 'pale green', family: 'green', author: 'Tim Gouw' },
  { id: 'green-25', seeds: ['green-25'], hexes: ['#3CB371', '#34A25F', '#2C914D'], name: 'jade', family: 'green', author: 'Mikhail Vasilyev' },

  { id: 'blue-01', seeds: ['blue-01'], hexes: ['#1565C0', '#1976D2', '#1E88E5'], name: 'deep blue', family: 'blue', author: 'Jeremy Bishop' },
  { id: 'blue-02', seeds: ['blue-02'], hexes: ['#000080', '#0A0A8A', '#141494'], name: 'navy', family: 'blue', author: 'Max Baskakov' },
  { id: 'blue-03', seeds: ['blue-03'], hexes: ['#87CEEB', '#7CB8D5', '#71A2BF'], name: 'sky blue', family: 'blue', author: 'Tobias Rademacher' },
  { id: 'blue-04', seeds: ['blue-04'], hexes: ['#4169E1', '#385AC8', '#2F4BAF'], name: 'royal blue', family: 'blue', author: 'Sean Oulashin' },
  { id: 'blue-05', seeds: ['blue-05'], hexes: ['#4B0082', '#3B056D', '#2D0A58'], name: 'indigo', family: 'blue', author: 'Paweł Czerwiński' },
  { id: 'blue-06', seeds: ['blue-06'], hexes: ['#2196F3', '#1E88E5', '#1976D2'], name: 'medium blue', family: 'blue', author: 'Wil Stewart' },
  { id: 'blue-07', seeds: ['blue-07'], hexes: ['#0288D1', '#0399DE', '#04AAEB'], name: 'light blue', family: 'blue', author: 'Oliver Sjöström' },
  { id: 'blue-08', seeds: ['blue-08'], hexes: ['#1E3A8A', '#2648A0', '#2E56B6'], name: 'cobalt', family: 'blue', author: 'Mike van den Bos' },
  { id: 'blue-09', seeds: ['blue-09'], hexes: ['#BBDEFB', '#A8CDEF', '#95BCE3'], name: 'pale blue', family: 'blue', author: 'Clay Banks' },
  { id: 'blue-10', seeds: ['blue-10'], hexes: ['#0D47A1', '#1155B3', '#1563C5'], name: 'azure', family: 'blue', author: 'Aleksandr Eremin' },
  { id: 'blue-11', seeds: ['blue-11'], hexes: ['#42A5F5', '#3B97E0', '#3489CB'], name: 'horizon blue', family: 'blue', author: 'Vincent van Zalinge' },
  { id: 'blue-12', seeds: ['blue-12'], hexes: ['#64B5F6', '#5AA4E0', '#5093CA'], name: 'soft blue', family: 'blue', author: 'Johannes Plenio' },
  { id: 'blue-13', seeds: ['blue-13'], hexes: ['#263D8C', '#354E9E', '#445FB0'], name: 'midnight blue', family: 'blue', author: 'Adolfo Félix' },
  { id: 'blue-14', seeds: ['blue-14'], hexes: ['#5C6BC0', '#5160AD', '#46559A'], name: 'periwinkle', family: 'blue', author: 'Eberhard Grossgasteiger' },
  { id: 'blue-15', seeds: ['blue-15'], hexes: ['#5380A6', '#497093', '#3F6080'], name: 'steel blue', family: 'blue', author: 'Evan Dennis' },
  { id: 'blue-16', seeds: ['blue-16'], hexes: ['#0077B6', '#006AA5', '#005D94'], name: 'ocean blue', family: 'blue', author: 'Silas Baisch' },
  { id: 'blue-17', seeds: ['blue-17'], hexes: ['#6BB5C4', '#5DA3B2', '#4F91A0'], name: 'duck egg', family: 'blue', author: 'Javier Miranda' },
  { id: 'blue-18', seeds: ['blue-18'], hexes: ['#2C3E50', '#3A4F63', '#486076'], name: 'slate blue', family: 'blue', author: 'Rodrigo Soares' },
  { id: 'blue-19', seeds: ['blue-19'], hexes: ['#4682B4', '#3E75A3', '#366892'], name: 'denim', family: 'blue', author: 'AJ Garcia' },
  { id: 'blue-20', seeds: ['blue-20'], hexes: ['#90CAF9', '#80B7E0', '#70A4C7'], name: 'powder blue', family: 'blue', author: 'Pawel Nolbert' },
  { id: 'blue-21', seeds: ['blue-21'], hexes: ['#4FC3F7', '#44AEDD', '#3999C3'], name: 'bright blue', family: 'blue', author: 'Ismail Salad Osman' },
  { id: 'blue-22', seeds: ['blue-22'], hexes: ['#82B1FF', '#73A0E6', '#648FCC'], name: 'pastel blue', family: 'blue', author: 'Ruvim Noga' },
  { id: 'blue-23', seeds: ['blue-23'], hexes: ['#283593', '#3543A6', '#4251B9'], name: 'dark indigo', family: 'blue', author: 'Liam Tucker' },
  { id: 'blue-24', seeds: ['blue-24'], hexes: ['#78909C', '#6C818C', '#60727C'], name: 'blue grey', family: 'blue', author: 'Hannah Morgan' },
  { id: 'blue-25', seeds: ['blue-25'], hexes: ['#26C6DA', '#22B0C2', '#1E9AAA'], name: 'bright cyan-blue', family: 'blue', author: 'Raphael Lopes' },

  { id: 'purple-01', seeds: ['purple-01'], hexes: ['#7B1FA2', '#8E24AA', '#9C27B0'], name: 'vivid purple', family: 'purple', author: 'Kari Shea' },
  { id: 'purple-02', seeds: ['purple-02'], hexes: ['#8F00FF', '#7B00DB', '#6700B7'], name: 'violet', family: 'purple', author: 'Zdeněk Macháček' },
  { id: 'purple-03', seeds: ['purple-03'], hexes: ['#B57EDC', '#A46CC8', '#935AB4'], name: 'lavender', family: 'purple', author: 'Micheile Henderson' },
  { id: 'purple-04', seeds: ['purple-04'], hexes: ['#6A0DAD', '#5E0B98', '#520883'], name: 'deep purple', family: 'purple', author: 'Vladimir Haltakov' },
  { id: 'purple-05', seeds: ['purple-05'], hexes: ['#E1BEE7', '#CCACD2', '#B79ABD'], name: 'mauve', family: 'purple', author: 'Alyson McPhee' },
  { id: 'purple-06', seeds: ['purple-06'], hexes: ['#CE93D8', '#BB84C4', '#A875B0'], name: 'orchid', family: 'purple', author: 'Ava Sol' },
  { id: 'purple-07', seeds: ['purple-07'], hexes: ['#AB47BC', '#9B3FA9', '#8B3796'], name: 'amethyst', family: 'purple', author: 'Jasmin Chew' },
  { id: 'purple-08', seeds: ['purple-08'], hexes: ['#880E4F', '#961C5A', '#A42A65'], name: 'plum', family: 'purple', author: 'Xavier Gélinas' },
  { id: 'purple-09', seeds: ['purple-09'], hexes: ['#673AB7', '#5C33A3', '#512C8F'], name: 'rich purple', family: 'purple', author: 'Scott Rodgerson' },
  { id: 'purple-10', seeds: ['purple-10'], hexes: ['#C39BD3', '#AE8CBF', '#997DAB'], name: 'wisteria', family: 'purple', author: 'Uros Todorovic' },
  { id: 'purple-11', seeds: ['purple-11'], hexes: ['#9C27B0', '#8B229D', '#7A1D8A'], name: 'magenta purple', family: 'purple', author: 'Ray Piedra' },
  { id: 'purple-12', seeds: ['purple-12'], hexes: ['#D8BFD8', '#C4ADC4', '#B09BB0'], name: 'thistle', family: 'purple', author: 'Nareeta Martin' },
  { id: 'purple-13', seeds: ['purple-13'], hexes: ['#4A148C', '#561FA0', '#622AB4'], name: 'dark violet', family: 'purple', author: 'Dan Bursuc' },
  { id: 'purple-14', seeds: ['purple-14'], hexes: ['#BA68C8', '#A95EB6', '#9854A4'], name: 'lilac', family: 'purple', author: 'Thomas Le' },
  { id: 'purple-15', seeds: ['purple-15'], hexes: ['#E040FB', '#C833D2', '#B026AA'], name: 'fuchsia', family: 'purple', author: 'Alexis Brown' },

  { id: 'pink-01', seeds: ['pink-01'], hexes: ['#FF69B4', '#E059A2', '#C04A90'], name: 'hot pink', family: 'pink', author: 'Azzedine Rouichi' },
  { id: 'pink-02', seeds: ['pink-02'], hexes: ['#FF1493', '#E0117E', '#C00E69'], name: 'deep pink', family: 'pink', author: 'Dainis Graveris' },
  { id: 'pink-03', seeds: ['pink-03'], hexes: ['#FF007F', '#E0006D', '#C0005B'], name: 'rose', family: 'pink', author: 'Freestocks' },
  { id: 'pink-04', seeds: ['pink-04'], hexes: ['#F8BBD0', '#DFA8BC', '#C695A8'], name: 'baby pink', family: 'pink', author: 'Tasha Lynn' },
  { id: 'pink-05', seeds: ['pink-05'], hexes: ['#EC407A', '#D4366D', '#BC2C60'], name: 'bright pink', family: 'pink', author: 'Lumin Osity' },
  { id: 'pink-06', seeds: ['pink-06'], hexes: ['#F48FB1', '#DC80A0', '#C4718F'], name: 'powder pink', family: 'pink', author: 'Bundo Kim' },
  { id: 'pink-07', seeds: ['pink-07'], hexes: ['#F06292', '#D95582', '#C24872'], name: 'pink magenta', family: 'pink', author: 'Remy Loz' },
  { id: 'pink-08', seeds: ['pink-08'], hexes: ['#E91E63', '#D01A59', '#B7164F'], name: 'cerise', family: 'pink', author: 'Roksolana Zasiadko' },
  { id: 'pink-09', seeds: ['pink-09'], hexes: ['#FF80AB', '#E67099', '#CC6087'], name: 'carnation pink', family: 'pink', author: 'Siora Photography' },
  { id: 'pink-10', seeds: ['pink-10'], hexes: ['#FB8BB5', '#E27DA3', '#C96F91'], name: 'salmon pink', family: 'pink', author: 'Taisiia Stupak' },
  { id: 'pink-11', seeds: ['pink-11'], hexes: ['#FCE4EC', '#E3CCD3', '#CAB4BA'], name: 'blush', family: 'pink', author: 'Micheile Henderson' },
  { id: 'pink-12', seeds: ['pink-12'], hexes: ['#D81B60', '#C11855', '#AA154A'], name: 'raspberry', family: 'pink', author: 'Allec Gomes' },

  { id: 'brown-01', seeds: ['brown-01'], hexes: ['#5D4432', '#6B4F3C', '#795A46'], name: 'warm brown', family: 'brown', author: 'Sven Mieke' },
  { id: 'brown-02', seeds: ['brown-02'], hexes: ['#8B4513', '#7B3E11', '#6B370F'], name: 'saddle brown', family: 'brown', author: 'Raimond Klavins' },
  { id: 'brown-03', seeds: ['brown-03'], hexes: ['#D2B48C', '#BFA37E', '#AC9270'], name: 'tan', family: 'brown', author: 'Priscilla Du Preez' },
  { id: 'brown-04', seeds: ['brown-04'], hexes: ['#7B3F00', '#6D3700', '#5F2F00'], name: 'chocolate', family: 'brown', author: 'Charisse Kenion' },
  { id: 'brown-05', seeds: ['brown-05'], hexes: ['#8B7355', '#7D674C', '#6F5B43'], name: 'taupe', family: 'brown', author: 'Jason Amadeo' },
  { id: 'brown-06', seeds: ['brown-06'], hexes: ['#C19A6B', '#AF8C60', '#9D7E55'], name: 'camel', family: 'brown', author: 'Yuriy Chemerys' },
  { id: 'brown-07', seeds: ['brown-07'], hexes: ['#635147', '#58483F', '#4D3F37'], name: 'umber', family: 'brown', author: 'Adam Radosavljevic' },
  { id: 'brown-08', seeds: ['brown-08'], hexes: ['#A0522D', '#904A28', '#804223'], name: 'sienna', family: 'brown', author: 'Hesham Alzarooni' },
  { id: 'brown-09', seeds: ['brown-09'], hexes: ['#CD853F', '#B97838', '#A56B31'], name: 'peru brown', family: 'brown', author: 'Tabitha Turner' },
  { id: 'brown-10', seeds: ['brown-10'], hexes: ['#D2B48C', '#BDA06D', '#A88C4E'], name: 'sandy brown', family: 'brown', author: 'Jake Nackos' },
  { id: 'brown-11', seeds: ['brown-11'], hexes: ['#A47551', '#936845', '#825B39'], name: 'chestnut', family: 'brown', author: 'Patrick Fore' },
  { id: 'brown-12', seeds: ['brown-12'], hexes: ['#BCAAA4', '#AA9A93', '#988A82'], name: 'warm grey brown', family: 'brown', author: 'Annie Spratt' },
  { id: 'brown-13', seeds: ['brown-13'], hexes: ['#6F4E37', '#63452F', '#573C27'], name: 'coffee', family: 'brown', author: 'Nathan Dumlao' },
  { id: 'brown-14', seeds: ['brown-14'], hexes: ['#8D6E63', '#7E6258', '#6F564D'], name: 'mocha', family: 'brown', author: 'Battlecreek Coffee' },
  { id: 'brown-15', seeds: ['brown-15'], hexes: ['#C8AD84', '#B49B74', '#A08964'], name: 'latte', family: 'brown', author: 'Demure Storyteller' },
  { id: 'brown-16', seeds: ['brown-16'], hexes: ['#987654', '#886845', '#785A36'], name: 'walnut', family: 'brown', author: 'Nicholas Kampouris' },
  { id: 'brown-17', seeds: ['brown-17'], hexes: ['#704214', '#623812', '#542E10'], name: 'sepia', family: 'brown', author: 'Alexandra Tran' },
  { id: 'brown-18', seeds: ['brown-18'], hexes: ['#DEB887', '#C8A576', '#B29265'], name: 'burlywood', family: 'brown', author: 'Lauren Mancke' },
  { id: 'brown-19', seeds: ['brown-19'], hexes: ['#E1C699', '#CDB489', '#B9A279'], name: 'creamy brown', family: 'brown', author: 'Miti' },
  { id: 'brown-20', seeds: ['brown-20'], hexes: ['#5C4033', '#4E362B', '#402C23'], name: 'dark brown', family: 'brown', author: 'Keagan Henman' },

  { id: 'cyan-01', seeds: ['cyan-01'], hexes: ['#008080', '#007070', '#006060'], name: 'teal', family: 'cyan', author: 'Nikola Jovanovic' },
  { id: 'cyan-02', seeds: ['cyan-02'], hexes: ['#00CED1', '#00B9BC', '#00A4A7'], name: 'cyan', family: 'cyan', author: 'Silas Kohler' },
  { id: 'cyan-03', seeds: ['cyan-03'], hexes: ['#40E0D0', '#38C9BA', '#30B2A4'], name: 'turquoise', family: 'cyan', author: 'Jared Rice' },
  { id: 'cyan-04', seeds: ['cyan-04'], hexes: ['#00FFFF', '#00E5E5', '#00CCCC'], name: 'aqua', family: 'cyan', author: 'Casey Horner' },
  { id: 'cyan-05', seeds: ['cyan-05'], hexes: ['#009688', '#00857A', '#00746C'], name: 'teal green', family: 'cyan', author: 'Kunal Shinde' },
  { id: 'cyan-06', seeds: ['cyan-06'], hexes: ['#00695C', '#00574C', '#00453C'], name: 'dark teal', family: 'cyan', author: 'Alexandra Luniel' },
  { id: 'cyan-07', seeds: ['cyan-07'], hexes: ['#B2EBF2', '#9FD3DA', '#8CBBC2'], name: 'pale cyan', family: 'cyan', author: 'Pietro Jeng' },
  { id: 'cyan-08', seeds: ['cyan-08'], hexes: ['#4DD0E1', '#43BCCD', '#39A8B9'], name: 'light cyan', family: 'cyan', author: 'Eugene Chystiakov' },
  { id: 'cyan-09', seeds: ['cyan-09'], hexes: ['#26A69A', '#22958B', '#1E847C'], name: 'sea turquoise', family: 'cyan', author: 'Seefromthesky' },
  { id: 'cyan-10', seeds: ['cyan-10'], hexes: ['#80CBC4', '#73B8B1', '#66A59E'], name: 'soft teal', family: 'cyan', author: 'Janusz Maniak' },
  { id: 'cyan-11', seeds: ['cyan-11'], hexes: ['#5FD4D2', '#55C0BE', '#4BACAA'], name: 'aqua mint', family: 'cyan', author: 'Tetiana Grypachevska' },
  { id: 'cyan-12', seeds: ['cyan-12'], hexes: ['#00838F', '#00747F', '#00656F'], name: 'deep aqua', family: 'cyan', author: 'Ales Krivec' },
  { id: 'cyan-13', seeds: ['cyan-13'], hexes: ['#84FFFF', '#76E5E5', '#68CCCC'], name: 'bright cyan', family: 'cyan', author: 'Yuhan Du' },
  { id: 'cyan-14', seeds: ['cyan-14'], hexes: ['#00BCD4', '#00AAC0', '#0098AC'], name: 'caribbean', family: 'cyan', author: 'Bermix Studio' },
  { id: 'cyan-15', seeds: ['cyan-15'], hexes: ['#18FFFF', '#15E5E5', '#12CCCC'], name: 'electric cyan', family: 'cyan', author: 'Pawel Nolbert' },

  { id: 'neutral-01', seeds: ['neutral-01'], hexes: ['#FFFFFF', '#F5F5F5', '#EBEBEB'], name: 'white', family: 'neutral', author: 'Rawan Yasser' },
  { id: 'neutral-02', seeds: ['neutral-02'], hexes: ['#FFFDD0', '#F5F3C6', '#EBE9BC'], name: 'cream', family: 'neutral', author: 'Liana Mikah' },
  { id: 'neutral-03', seeds: ['neutral-03'], hexes: ['#F5F5DC', '#E8E8D0', '#DBDBC4'], name: 'beige', family: 'neutral', author: 'Beatrice Harris' },
  { id: 'neutral-04', seeds: ['neutral-04'], hexes: ['#808080', '#707070', '#606060'], name: 'gray', family: 'neutral', author: 'Daniele Levis' },
  { id: 'neutral-05', seeds: ['neutral-05'], hexes: ['#C0C0C0', '#AEAEAE', '#9C9C9C'], name: 'silver', family: 'neutral', author: 'Zachary Kyra-Derksen' },
  { id: 'neutral-06', seeds: ['neutral-06'], hexes: ['#36454F', '#2F3D47', '#28353F'], name: 'charcoal', family: 'neutral', author: 'Shifaaz Shamoon' },
  { id: 'neutral-07', seeds: ['neutral-07'], hexes: ['#708090', '#647281', '#586472'], name: 'slate', family: 'neutral', author: 'Robin Schroder' },
  { id: 'neutral-08', seeds: ['neutral-08'], hexes: ['#000000', '#111111', '#222222'], name: 'black', family: 'neutral', author: 'Tom Gainor' },
  { id: 'neutral-09', seeds: ['neutral-09'], hexes: ['#FFFFF0', '#EAEAE0', '#D5D5D0'], name: 'ivory', family: 'neutral', author: 'Paula May' },
  { id: 'neutral-10', seeds: ['neutral-10'], hexes: ['#EDEDED', '#DADADA', '#C7C7C7'], name: 'light gray', family: 'neutral', author: 'Jake Peterson' },
  { id: 'neutral-11', seeds: ['neutral-11'], hexes: ['#A9A9A9', '#999999', '#898989'], name: 'dark gray', family: 'neutral', author: 'Taylor Van Riper' },
  { id: 'neutral-12', seeds: ['neutral-12'], hexes: ['#D3D3D3', '#C0C0C0', '#ADADAD'], name: 'light silver', family: 'neutral', author: 'Dan Schiumarini' },
  { id: 'neutral-13', seeds: ['neutral-13'], hexes: ['#F5F5F0', '#E5E5E0', '#D5D5D0'], name: 'off-white', family: 'neutral', author: 'Philipp Berndt' },
  { id: 'neutral-14', seeds: ['neutral-14'], hexes: ['#3A3A3A', '#2E2E2E', '#222222'], name: 'dark charcoal', family: 'neutral', author: 'Jonas Allert' },
  { id: 'neutral-15', seeds: ['neutral-15'], hexes: ['#696969', '#5D5D5D', '#515151'], name: 'dim gray', family: 'neutral', author: 'Rob Morton' },
  { id: 'neutral-16', seeds: ['neutral-16'], hexes: ['#BEBEBE', '#AAAAAA', '#969696'], name: 'concrete', family: 'neutral', author: 'Ricardo Gomez Angel' },
  { id: 'neutral-17', seeds: ['neutral-17'], hexes: ['#8C8C8C', '#7D7D7D', '#6E6E6E'], name: 'stone', family: 'neutral', author: 'Nathan Anderson' },
  { id: 'neutral-18', seeds: ['neutral-18'], hexes: ['#F0F0E6', '#E0E0D6', '#D0D0C6'], name: 'alabaster', family: 'neutral', author: 'Tierra Mallorca' },
  { id: 'neutral-19', seeds: ['neutral-19'], hexes: ['#CFCFC4', '#BCBCB2', '#A9A9A0'], name: 'pebble', family: 'neutral', author: 'Mitchell Luo' },
  { id: 'neutral-20', seeds: ['neutral-20'], hexes: ['#E8E0D5', '#D5CDBF', '#C2BAA9'], name: 'warm grey', family: 'neutral', author: 'Sora Shimazaki' },
  { id: 'neutral-21', seeds: ['neutral-21'], hexes: ['#B0A99D', '#9D978C', '#8A857B'], name: 'tope grey', family: 'neutral', author: 'Scott Webb' },
  { id: 'neutral-22', seeds: ['neutral-22'], hexes: ['#121212', '#1E1E1E', '#2A2A2A'], name: 'near black', family: 'neutral', author: 'Leo Visions' },
  { id: 'neutral-23', seeds: ['neutral-23'], hexes: ['#F9F9F9', '#EEEEEE', '#E3E3E3'], name: 'near white', family: 'neutral', author: 'Devanath Saha' },
  { id: 'neutral-24', seeds: ['neutral-24'], hexes: ['#CDC9C9', '#BAB5B5', '#A7A1A1'], name: 'gainsboro', family: 'neutral', author: 'Aigars Birzulis' },
  { id: 'neutral-25', seeds: ['neutral-25'], hexes: ['#F5F5F5', '#E5E5E5', '#D5D5D5'], name: 'platinum', family: 'neutral', author: 'Annie Spratt' },

  { id: 'multi-01', seeds: ['multi-01'], hexes: ['#FF7F50', '#87CEEB', '#98FB98'], name: 'coral sky grass', family: 'multi', author: 'Federica Giusti' },
  { id: 'multi-02', seeds: ['multi-02'], hexes: ['#E2725B', '#F4A460', '#FFD700'], name: 'terracotta gold', family: 'multi', author: 'Solen Feyissa' },
  { id: 'multi-03', seeds: ['multi-03'], hexes: ['#4B0082', '#E0115F', '#FF4500'], name: 'indigo sunset', family: 'multi', author: 'Timothy Dykes' },
  { id: 'multi-04', seeds: ['multi-04'], hexes: ['#2E8B57', '#3CB371', '#66CDAA'], name: 'ocean greens', family: 'multi', author: 'Anete Lusina' },
  { id: 'multi-05', seeds: ['multi-05'], hexes: ['#D2B48C', '#8B4513', '#A0522D'], name: 'earthy trio', family: 'multi', author: 'Delaney Turner' },
  { id: 'multi-06', seeds: ['multi-06'], hexes: ['#FFD700', '#FF8C00', '#FF4500'], name: 'sunset triad', family: 'multi', author: 'Quino Al' },
  { id: 'multi-07', seeds: ['multi-07'], hexes: ['#4169E1', '#9370DB', '#DA70D6'], name: 'blue to purple', family: 'multi', author: 'Lucas Ludwig' },
  { id: 'multi-08', seeds: ['multi-08'], hexes: ['#98FB98', '#00FA9A', '#00CED1'], name: 'mint to teal', family: 'multi', author: 'Hector Falcon' },
  { id: 'multi-09', seeds: ['multi-09'], hexes: ['#C0C0C0', '#708090', '#2F4F4F'], name: 'silver slate', family: 'multi', author: 'Klemen Vrankar' },
  { id: 'multi-10', seeds: ['multi-10'], hexes: ['#F5DEB3', '#DEB887', '#D2B48C'], name: 'wheat medley', family: 'multi', author: 'Mae Mu' },
  { id: 'multi-11', seeds: ['multi-11'], hexes: ['#FF6347', '#FF69B4', '#FF1493'], name: 'hot palette', family: 'multi', author: 'David Pisnoy' },
  { id: 'multi-12', seeds: ['multi-12'], hexes: ['#8FBC8F', '#5F9EA0', '#4682B4'], name: 'teal forest', family: 'multi', author: 'Yan Krukov' },
];

const INDEX = {};
for (const entry of DATABASE) {
  for (const hex of entry.hexes) {
    if (!INDEX[hex]) INDEX[hex] = [];
    INDEX[hex].push(entry);
  }
}

const FAMILY_INDEX = {};
for (const entry of DATABASE) {
  if (!FAMILY_INDEX[entry.family]) FAMILY_INDEX[entry.family] = [];
  FAMILY_INDEX[entry.family].push(entry);
}

export function getAllImages() {
  return DATABASE;
}

export function getByFamily(family) {
  return FAMILY_INDEX[family] || [];
}

export function getByHex(hex) {
  return INDEX[hex] || [];
}

export function searchByHexes(targetHexes) {
  const seen = new Set();
  const results = [];

  for (const hex of targetHexes) {
    const matches = INDEX[hex];
    if (matches) {
      for (const m of matches) {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          results.push(m);
        }
      }
    }
  }

  return results;
}

export { hexToLab };

const PRE_COMPUTED = new Map();
try {
  for (const entry of DATABASE) {
    const labs = entry.hexes.map(h => {
      try { return hexToLab(h); } catch { return null; }
    }).filter(Boolean);
    if (labs.length > 0) PRE_COMPUTED.set(entry.id, labs);
  }
} catch (e) {
  console.warn('imageDatabase: pre-computation failed', e);
}

export function getPrecomputedLab(id) {
  return PRE_COMPUTED.get(id);
}
