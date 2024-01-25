<template>
  <table>
    <span class="table-row-group sticky top-0 bg-gray-200">
      <tr>
        <td colspan="9999">
          Generated at
          {{ generated }}, avg score: {{ avgScore }}
        </td>
      </tr>
      <tr>
        <td></td>
        <td></td>
        <td>Test</td>
        <td class="px-1" v-for="test in sortedTests">
          <a :href="'https://www.cs.utexas.edu/~gheith/' + test.inputUrl">
            {{ test.name.replace(/^0*/, '') }}
          </a>
        </td>
      </tr>
      <tr>
        <td></td>
        <td>
          <input type="checkbox" v-model="weightedFirst" />
        </td>
        <td>Weight</td>
        <td class="px-1" v-for="test in sortedTests">
          <a :href="'https://www.cs.utexas.edu/~gheith/' + test.argsUrl">
            {{ test.weight }}
          </a>
        </td>
      </tr>
      <tr>
        <td></td>
        <td></td>
        <td>Passing</td>
        <td v-for="test in sortedTests" class="px-1">
          <a :href="'https://www.cs.utexas.edu/~gheith/' + test.okUrl">
            {{ test.passing }}
          </a>
        </td>
      </tr>
      <tr
        v-for="submission in submissions.filter((s) => s.pinned)"
        :key="submission.id"
        :class="`${submission.pinned ? 'sticky' : ''}`"
        @change="updateLocalStoragePin($event.target.checked, submission.num)"
        :style="{backgroundColor: (submission.isGheith ? 'yellow' : '')}"
      >
        <td>
          <input type="checkbox" v-model="submission.pinned" />
        </td>
        <td>{{ submission.id.replace(/^0*/, '') }}</td>
        <td>{{ submission.score }}</td>
        <td
          :class="getColor(sortedTests[index], result)"
          v-for="(result, index) in submission.results"
        >
          {{ result === false ? 'x' : result }}
        </td>
      </tr>
    </span>
    <tr
      v-for="submission in submissions.filter((s) => !s.pinned)"
      :key="submission.id"
      :class="`${submission.pinned ? 'sticky' : ''}`"
      :style="{backgroundColor: (submission.isGheith ? 'yellow' : '')}"
    >
      <td>
        <input
          type="checkbox"
          v-model="submission.pinned"
          @change="updateLocalStoragePin($event.target.checked, submission.num)"
        />
      </td>
      <td :title="submission.hash">{{ submission.id.replace(/^0*/, '') }}</td>
      <td>{{ submission.score }}</td>
      <td
        :class="getColor(sortedTests[index], result)"
        v-for="(result, index) in submission.results"
      >
        {{ result === false ? 'x' : result }}
      </td>
    </tr>
  </table>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'

let weightedFirst = ref(localStorage.getItem('weightedFirst') === 'true')
watch(weightedFirst, (newValue) => {
  localStorage.setItem('weightedFirst', newValue)
})
const generated = ref('')
let tests = ref([])
const sortedTests = computed(() => {
  return weightedFirst.value
    ? [...tests.value].sort((a, b) => b.weight - a.weight)
    : tests.value
})
const avgScore = computed(() =>
  (
    submissions.value.reduce(
      (acc, submission) => acc + parseInt(submission.score),
      0
    ) / submissions.value.length
  ).toFixed(0)
)

const getColor = (test, result) => {
  return (test.weight > 0
    ? 'bg-green-200'
    : (test.passing < 2 || test.invalid)
    ? 'bg-red-200'
    : test.challenge
    ? 'bg-orange-200'
    : '') + ' ' + (['?', false].includes(result) ? 'text-red-600 font-bold' : '')
}

let submissions = ref([])
onMounted(async () => {
  try {
    const data = await (
      await fetch(
        process.env.NODE_ENV === 'production'
          ? `https://www.cs.utexas.edu/~gheith/${window.location.pathname.split('/')[2]}`
          : 'cs429h_s22_p2.html',
          {cache: "no-store"}
      )
    ).text()
    const root = new DOMParser().parseFromString(data, 'text/html')
    generated.value = root.querySelectorAll('td')[3].textContent
    tests.value = Array.from(
      root
        .querySelectorAll('tbody')[2]
        .querySelector('tr')
        .querySelectorAll('pre>a'),
      (a) => ({
        inputUrl: a.attributes.href.textContent,
        fileName: a.attributes.title.textContent,
        name: a.attributes.title.textContent.split('.')[0],
        weight: 0
      })
    )
    Array.from(root.querySelectorAll('tbody')[2].querySelectorAll('tr'))
      .splice(3)
      .forEach((tr) => {
        const num = tr.querySelector('td>pre').textContent.split('_')[0]
        const resultsObj = Array.from(tr.querySelectorAll('td>pre'))
          .splice(2)
          .reduce((acc, a, i) => {
            acc[tests.value[i].name] = a.textContent === '.' ? '.' : a.textContent === 'X' ? false : '?'
            return acc
          }, {})
        submissions.value.push({
          id: tr.querySelector('td>pre').textContent,
          num,
          hash: tr.querySelector('td>pre').attributes.title.textContent,
          score: tr.querySelectorAll('td>pre')[1].textContent,
          pinned: localStorage.getItem(`pinned_${num}`) === 'true',
          isGheith: tr.getAttribute('bgColor') === 'yellow',
          // results: Array.from(tr.querySelectorAll('td>pre'))
          //   .splice(2)
          //   .map((a) => a.textContent == '.')
          results: computed(() =>
            sortedTests.value.map((t) => resultsObj[t.name])
          )
        })
      })
    Array.from(
      root
        .querySelectorAll('tbody')[2]
        .querySelectorAll('tr')[1]
        .querySelectorAll('pre>a'),
      (a) => a.attributes.href.textContent
    ).forEach((argsUrl, i) => {
      tests.value[i].argsUrl = argsUrl
      tests.value[i].passing = submissions.value.filter(
        (s) => s.results[i] === '.'
      ).length
    })
    Array.from(
      root
        .querySelectorAll('tbody')[2]
        .querySelectorAll('tr')[2]
        .querySelectorAll('pre>a'),
      (a) => a.attributes.href.textContent
    ).forEach((okUrl, i) => {
      tests.value[i].okUrl = okUrl
      tests.value[i].passing = submissions.value.filter(
        (s) => s.results[i] === '.'
      ).length
    })
    Array.from(
      root.querySelectorAll('tbody')[4].querySelectorAll('tr')
    ).forEach((tr) => {
      tests.value.find(
        (t) => t.name === tr.querySelector('td').textContent
      ).weight = parseFloat(tr.querySelectorAll('td')[1].textContent)
    })

    // Add invalid tests from piazza
    const invalid = [
      // '058'
    ]
    invalid.forEach((num) => {
      tests.value.find((t) => t.name === num).invalid = true
    })


    // // Add challenge tests from piazza
    // tests.value.find((t) => t.name === '017').challenge = true

    // Add selected tests from piazza
    const selected = [
'009','011','012','014','017','023','033','036','041','052'
    ]
    if (window.location.hash.slice(1) == 'cs439t_f22_p9.html')
    selected.forEach((num) => {
      tests.value.find((t) => t.name === num).weight = 1
    })
  } catch (error) {
    console.error(error)
  }
})
const updateLocalStoragePin = (pinned, num) => {
  localStorage.setItem(`pinned_${num}`, pinned.toString())
}
defineProps({
  msg: String
})
</script>
<style scoped>
a {
  color: blue;
}
</style>
