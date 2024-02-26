import {Component} from 'react'
import Cookies from 'js-cookie'
import {MdLocationOn} from 'react-icons/md'
import {AiFillStar} from 'react-icons/ai'
import {BiLinkExternal} from 'react-icons/bi'
import Loader from 'react-loader-spinner'
import Header from '../Header'
import SimilarJobItem from '../SimilarJobItem'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class AboutJobItem extends Component {
  state = {
    jobDataDetails: [],
    similarJobData: [],
    apiStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getJobData()
  }

  getJobData = async props => {
    const {match} = this.props
    const {params} = match
    const {id} = params
    this.setState({
      apiStatus: apiStatusConstants.inProgress,
    })
    const jwtToken = Cookies.get('jwt_token')
    const jobDetailsUrl = `https://apis.ccbp.in/jobs/${id}`
    const optionsJobData = {
      headers: {Authorization: `Bearer${jwtToken}`},
      method: 'GET',
    }
    const responseJobData = await fetch(jobDetailsUrl, optionsJobData)
    if (responseJobData.ok === true) {
      const fetchJobData = await responseJobData.json()
      const updatedJobDetails = [fetchJobData.job_details].map(eachItem => ({
        companyLogoUrl: eachItem.company_logo_url,
        compnayWebsiteUrl: eachItem.company_website_url,
        employmentType: eachItem.employment_type,
        id: eachItem.id,
        jobDescription: eachItem.job_description,
        lifeAtCompany: {
          description: eachItem.life_at_company.description,
          imageUrl: eachItem.image_url,
        },
        location: eachItem.location,
        packagePerAnnum: eachItem.package_per_annum,
        rating: eachItem.rating,
        skills: eachItem.skills.map(eachSkills => ({
          imageUrl: eachSkills.image_url,
          name: eachSkills.name,
        })),
        title: eachItem.title,
      }))
      const updatedSimilarJobDetail = fetchJobData.similar_jobs.map(
        eachItem => ({
          companyLogoUrl: eachItem.company_logo_url,
          id: eachItem.id,
          jobDescription: eachItem.job_description,
          employmentType: eachItem.employment_type,
          location: eachItem.location,
          rating: eachItem.rating,
          title: eachItem.title,
        }),
      )
      this.setState({
        jobDataDetails: updatedJobDetails,
        similarJobData: updatedSimilarJobDetail,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
    }
  }

  renderJobDetailsSuccessView = () => {
    const {jobDataDetails, similarJobData} = this.state
    if (jobDataDetails.length >= 1) {
      const {
        companyLogoUrl,
        compnayWebsiteUrl,
        employmentType,
        id,
        jobDescription,
        lifeAtCompany,
        location,
        packagePerAnnum,
        rating,
        skills,
        title,
      } = jobDataDetails[0]
      return (
        <>
          <div className="job-items-container">
            <div className="first-part">
              <div className="image-title-container">
                <img
                  src={companyLogoUrl}
                  alt="website logo"
                  className="company-logo"
                />
                <div className="title-rating-container">
                  <h1 className="title">{title}</h1>
                  <div className="star-rating-container">
                    <AiFillStar className="star-icon" />
                    <p className="rating">{rating}</p>
                  </div>
                </div>
              </div>
              <div className="location-package-container">
                <div className="location-job-type-container">
                  <div className="location-icon-container">
                    <MdLocationOn className="location-icon" />
                    <p className="location">{location}</p>
                  </div>
                  <div className="employment-type-container">
                    <p className="job-type">{employmentType}</p>
                  </div>
                </div>
                <div className="package-container">
                  <p className="package">{packagePerAnnum}</p>
                </div>
              </div>
            </div>
            <hr className="line" />
            <div className="second-part">
              <div className="description-visit-container">
                <h1 className="job-description-heading">Description</h1>
                <a className="visit-link" href={compnayWebsiteUrl}>
                  Visit
                  <BiLinkExternal />
                </a>
              </div>
              <p className="paragraph">{jobDescription}</p>
            </div>
            <h1>Skills</h1>
            <ul className="ul-container">
              {skills.map(eachItem => (
                <li className="list-container" key={eachItem.name}>
                  <img
                    src={eachItem.imageUrl}
                    alt={eachItem.name}
                    className="skill-img"
                  />
                  <p>{eachItem.name}</p>
                </li>
              ))}
            </ul>
            <div className="company-life-img-container">
              <div className="life-container">
                <h1>Life at Company</h1>
                <p>{lifeAtCompany.description}</p>
              </div>
              <img src={lifeAtCompany.imageUrl} alt="Life at company" />
            </div>
          </div>
          <h1 className="similar-job-heading">Similar Jobs</h1>
          <ul className="similar-jobs-ul-container">
            {similarJobData.map(eachItem => (
              <SimilarJobItem
                key={eachItem.id}
                similarJobData={eachItem}
                employmentType={employmentType}
              />
            ))}
          </ul>
        </>
      )
    }
    return null
  }

  onRetryJobDetailsAgain = () => {
    this.getJobData()
  }

  renderJobFailureView = () => (
    <div className="job-failure-view">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
      />
      <h1>Opps! Something Went Wrong</h1>
      <p>we cannot seem to find the page you are looking for.</p>
      <div className="fail-btn-container">
        <button
          className="fail-job-btn"
          type="button"
          onClick={this.onRetryJobDetailsAgain}
        >
          retry
        </button>
      </div>
    </div>
  )

  renderJobLoadingView = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  renderJobDetails = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstants.success:
        return renderJobDetailsSuccessView()
      case apiStatusConstants.failure:
        return renderJobFailureView()
      case apiStatusConstants.inProgress:
        return renderJobLoadingView()
      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />
        <div className="job-details-view-container">
          {this.renderJobDetails()}
        </div>
      </>
    )
  }
}
export default AboutJobItem
