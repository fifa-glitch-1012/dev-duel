import token from '../../token'
import axios from 'axios'


export const getUserData = (url, req, res) => {
    console.log(url)
    let userData = {}
    let urls = {}
    
    return axios.get(url, {headers: {Authorization: token}})
        .then(data => data.data)
        .then(data => {
          //console.log(data)
          userData.username = data.login
          userData.fullName = data.name
          userData.location = data.location
          userData.email = data.email
          userData.bio = data.bio
          userData.avatar = data.avatar_url
          userData.followers = data.followers
          userData.following = data.following
          userData.publicRepos = data.public_repos
          urls.reposUrl = data.repos_url
          userData.titles = []
          //console.log(userData)
          //res.send(userData)
          return axios.get(urls.reposUrl, {headers: {Authorization: token}})
        })
        .then(data => data.data)
        .then(data => {
            [userData.totalStars, userData.highestStarCount] = getStars(data) 
            userData.perfectRepos = getPerfectRepos(data)
            let titles
            [userData.favoriteLanguage, titles]  = getFavoriteLanguage(data)
            userData.titles.push(...titles)
            userData.titles.push(...getTitles(data, userData.followers, userData.following))
            //console.log(userData)
            return userData
            //return axios.get('https://api.github.com/users/kentcdodds/following', {headers: {Authorization: token}})
        })
        // .then(data => data.data)
        // .then(data => {
        //     userData.following = data.length
        //     console.log(userData)
        //     //return axios.get(urls.reposUrl, {headers: {Authorization: token}})
        // })
        // .then(data => data.data)
        // .then(data => {
        //     console.log(data)
        // })
    
}

const getStars = repos => {
    let totalStars = 0
    let highestStars = 0

    for(let repo of repos){
        totalStars += repo.stargazers_count
        if(repo.stargazers_count > highestStars){
            highestStars = repo.stargazers_count
        }
    }
    return [totalStars, highestStars]
}

const getPerfectRepos = repos => {
    let perfect = 0
    for(let repo of repos){
        if(repo.open_issues_count === 0){
            perfect++
        }
    }
    return perfect
}

const getFavoriteLanguage = repos => {
    let languages = {}
    for(let repo of repos){
        if(repo.language in languages){
            languages[`${repo.language}`] += 1
        }else {
            if(repo.language){
                languages[`${repo.language}`] = 1
            }
        }
    }
    let titles = []
    if(Object.keys(languages).length > 10){
        titles.push('Jack of All Tradees')
    }else if(Object.keys(languages).length === 1){
        titles.push('One Trick Pony')
    }
    let count = 0
    let favoriteLanguage
    for(let language in languages){
      if(languages[language] > count){
          favoriteLanguage = language
          count = languages[language]
      }
    }

    return [favoriteLanguage, titles]
}

const getTitles = (repos, followers, following) => {
    let titles  = []
    if(following >= (followers*2) && following > 0){
        titles.push('Stalker')
    }else if(followers >= (following*2) && followers > 0){
        titles.push('Mr. Popular')
    }

    let forks = 0
    for(let repo of repos){
        if(repo.fork){
            forks++
        }
    }
    if((forks/repos.length) > 0.5){
        titles.push('Forker')
    }
    return titles
}
